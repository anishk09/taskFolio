import { NextRequest, NextResponse } from "next/server";
import { deleteVault, getVault, putVault } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ syncKey: string }> }) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`sync-get:${ip}`, 30, 3600))) {
    return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
  }

  const { syncKey } = await params;
  const vault = await getVault(syncKey);
  if (!vault) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, payload: vault.payload, updatedAt: vault.updatedAt });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ syncKey: string }> }) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`sync-post:${ip}`, 60, 3600))) {
    return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
  }

  const { syncKey } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("payload" in body)) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }
  try {
    await putVault(syncKey, body.payload);
  } catch {
    return NextResponse.json({ error: "Invalid or oversized payload" }, { status: 400 });
  }
  return NextResponse.json({ success: true, syncKey });
}

// Lets a device revoke a sync key it suspects has leaked — the record is
// deleted outright, so anyone still holding the old key gets a 404.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ syncKey: string }> }) {
  const ip = getClientIp(request);
  if (!(await checkRateLimit(`sync-delete:${ip}`, 20, 3600))) {
    return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
  }

  const { syncKey } = await params;
  await deleteVault(syncKey);
  return NextResponse.json({ success: true });
}
