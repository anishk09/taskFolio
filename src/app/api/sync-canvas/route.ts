import { NextRequest, NextResponse } from "next/server";

// Proxies a Canvas calendar feed so the browser doesn't have to make a
// cross-origin request to Canvas's servers (their .ics endpoints don't send
// CORS headers).
export async function GET(request: NextRequest) {
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
    const res = await fetch(parsed.toString());
    if (!res.ok) {
      return NextResponse.json({ error: `Feed responded with ${res.status}` }, { status: 502 });
    }
    const text = await res.text();
    return new NextResponse(text, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch calendar feed" }, { status: 502 });
  }
}
