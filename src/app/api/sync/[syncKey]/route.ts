import { NextRequest, NextResponse } from "next/server";
import { getVault, putVault } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ syncKey: string }> }) {
  const { syncKey } = await params;
  const vault = await getVault(syncKey);
  if (!vault) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, payload: vault.payload, updatedAt: vault.updatedAt });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ syncKey: string }> }) {
  const { syncKey } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("payload" in body)) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }
  await putVault(syncKey, body.payload);
  return NextResponse.json({ success: true, syncKey });
}
