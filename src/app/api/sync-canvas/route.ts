import dns from "node:dns/promises";
import net from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_FEED_BYTES = 2_000_000; // 2MB — a calendar feed has no business being bigger

// Proxies a Canvas/Classroom calendar feed so the browser doesn't have to make
// a cross-origin request to servers that don't send CORS headers. The target
// host is arbitrary by design (self-hosted Canvas instances live on any
// domain), so this blocks the actually dangerous part instead: requests
// resolving to private/internal/loopback network ranges (SSRF into internal
// infra or cloud metadata endpoints).
function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata
    return false;
  }
  if (net.isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
  }
  return true; // couldn't classify it — block rather than risk it
}

async function assertPublicHost(hostname: string): Promise<void> {
  if (hostname === "localhost") throw new Error("blocked host");
  const results = await dns.lookup(hostname, { all: true }).catch(() => {
    throw new Error("could not resolve host");
  });
  for (const r of results) {
    if (isPrivateOrReservedIp(r.address)) throw new Error("blocked host");
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`sync-canvas:${ip}`, 20, 3600))) {
    return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const fetchUrl = url.replace(/^webcal:\/\//i, "https://");
  let parsed: URL;
  try {
    parsed = new URL(fetchUrl);
  } catch {
    return NextResponse.json({ error: "Invalid feed URL" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) and webcal URLs are supported" }, { status: 400 });
  }

  try {
    await assertPublicHost(parsed.hostname);
  } catch {
    return NextResponse.json({ error: "That host can't be reached" }, { status: 400 });
  }

  try {
    // redirect: "manual" — a compromised/malicious server could otherwise
    // redirect a public URL to an internal one after the DNS check above.
    const res = await fetch(parsed.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
      return NextResponse.json({ error: "Feed redirects are not followed" }, { status: 400 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `Feed responded with ${res.status}` }, { status: 502 });
    }
    const contentLength = res.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_FEED_BYTES) {
      return NextResponse.json({ error: "Feed is too large" }, { status: 502 });
    }
    const text = await res.text();
    if (text.length > MAX_FEED_BYTES) {
      return NextResponse.json({ error: "Feed is too large" }, { status: 502 });
    }
    return new NextResponse(text, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch calendar feed" }, { status: 502 });
  }
}
