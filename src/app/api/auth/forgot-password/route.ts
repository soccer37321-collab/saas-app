import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/errors";
import { getClientIp, trackIpAccess } from "@/lib/ip-rate-limit";

const schema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export async function POST(req: NextRequest) {
  // IP-based rate limiting: max 5 reset requests per 5 minutes per IP
  const ip = getClientIp(req);
  const { count, suspicious, maskedIp } = await trackIpAccess(ip, "forgot-password");
  if (count > 5) {
    // Return 200 to avoid email enumeration (don't reveal if blocked)
    return NextResponse.json({ sent: true });
  }
  if (suspicious) {
    console.error("[forgot-password] suspicious IP:", maskedIp, "count:", count);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { email } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  // Always return success to prevent email enumeration attacks
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/settings`,
  });

  return NextResponse.json({ sent: true });
}
