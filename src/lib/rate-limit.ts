import { createAdminClient } from "./supabase/admin";

const HOURLY_LIMITS: Record<string, number> = {
  "generate-script": 10,
};

export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = HOURLY_LIMITS[endpoint] ?? 60;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("increment_rate_limit", {
      p_user_id: userId,
      p_endpoint: endpoint,
    });
    if (error) throw error;
    const count = data as number;
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (err) {
    // Fail open — rate-limit errors must not block legitimate requests
    console.error("[rate-limit] check failed:", err);
    return { allowed: true, remaining: 0 };
  }
}
