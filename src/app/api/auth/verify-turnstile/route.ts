import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { apiError } from "@/lib/errors";
import { logAudit } from "@/lib/audit";
import { getClientIp, trackIpAccess } from "@/lib/ip-rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { count, suspicious, maskedIp } = await trackIpAccess(ip, "auth");

  if (suspicious) {
    void logAudit(null, "suspicious_ip_auth_attempt", "auth/verify-turnstile", {
      masked_ip: maskedIp,
      count,
    });
  }

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
