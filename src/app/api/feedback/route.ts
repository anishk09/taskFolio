import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: NextRequest) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ error: "Feedback is not configured" }, { status: 503 });
  }

  const ip = getClientIp(request);
  if (!(await checkRateLimit(`feedback:${ip}`, 5, 3600))) {
    return NextResponse.json({ error: "Too many messages — try again later" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: smtpUser,
      subject: "🔔 taskFolio feedback — please read",
      text: message,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 502 });
  }
}
