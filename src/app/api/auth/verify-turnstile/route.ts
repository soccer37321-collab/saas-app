import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { apiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;

  if (!token) {
    return apiError("Turnstileトークンが必要です", 400);
  }

  const valid = await verifyTurnstileToken(token);
  if (!valid) {
    return apiError("CAPTCHA認証に失敗しました。もう一度お試しください。", 400);
  }

  return NextResponse.json({ success: true });
}
