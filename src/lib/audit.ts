import { createAdminClient } from "./supabase/admin";

export async function logAudit(
  userId: string | null,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({ user_id: userId, action, resource, metadata });
  } catch (err) {
    // Audit failures must never break the main request path
    console.error("[audit] log failed:", err);
  }
}
