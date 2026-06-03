import { createHash } from "crypto";
import { createAdminClient } from "./supabase/admin";

// Threshold: requests per 5-minute window before flagging as suspicious
const THRESHOLDS: Record<string, number> = {
  auth:              20,  // login/register attempts
  "generate-script": 15,  // Claude API calls
};

/** One-way hash of IP — never store raw IPs in the database. */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/** Mask IP for audit logs: show only first two octets. */
export function maskIp(ip: string): string {
  if (ip.includes(".")) {
    const p = ip.split(".");
    return `${p[0]}.${p[1]}.*.*`;
  }
  // IPv6: show first two groups
  const p = ip.split(":");
  return `${p[0]}:${p[1] ?? "*"}:****`;
}

/** Extract client IP from request headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const fwd = (req as unknown as { headers: { get(k: string): string | null } })
    .headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

export interface IpCheckResult {
  count:      number;
  suspicious: boolean;
  maskedIp:   string;
}

/**
 * Increment the 5-minute request counter for this IP+endpoint.
 * Returns whether the count exceeds the threshold (suspicious).
 * Fails open on DB errors — never blocks legitimate traffic.
 */
export async function trackIpAccess(
  ip: string,
  endpoint: string
): Promise<IpCheckResult> {
  const threshold = THRESHOLDS[endpoint] ?? 30;
  const maskedIp  = maskIp(ip);

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("increment_ip_rate_limit", {
      p_ip_hash: hashIp(ip),
      p_endpoint: endpoint,
    });
    if (error) throw error;
    const count = data as number;
    return { count, suspicious: count > threshold, maskedIp };
  } catch (err) {
    console.error("[ip-rate-limit] failed:", err instanceof Error ? err.message : String(err));
    return { count: 0, suspicious: false, maskedIp };
  }
}
