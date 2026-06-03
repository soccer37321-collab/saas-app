import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isPasswordPwned } from "@/lib/hibp";
import { apiError } from "@/lib/errors";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword:     z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const { currentPassword, newPassword } = parsed.data;

  // 1. Verify current password (use plain anon client — no SSR cookie side-effects)
  const verifyClient = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error: verifyError } = await verifyClient.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (verifyError) {
    return apiError("現在のパスワードが正しくありません", 401);
  }

  // 2. Server-side HIBP check
  try {
    const pwnCount = await isPasswordPwned(newPassword);
    if (pwnCount > 0) {
      return NextResponse.json(
        {
          error: `このパスワードは過去のデータ漏洩で${pwnCount.toLocaleString()}回使用されています。別のパスワードを設定してください。`,
          pwnCount,
        },
        { status: 422 }
      );
    }
  } catch (err) {
    // Fail open — HIBP API error must not block legitimate password changes
    console.error("[hibp] server check failed:", err instanceof Error ? err.message : String(err));
  }

  // 3. Update password via the user's session
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return apiError(updateError.message, 400, updateError);

  void logAudit(user.id, "password_changed", "auth/change-password");
  return NextResponse.json({ success: true });
}
