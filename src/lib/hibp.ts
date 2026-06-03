import { createHash } from "crypto";

const HIBP_API = "https://api.pwnedpasswords.com/range";

/**
 * k-Anonymity model: send only the first 5 chars of SHA1,
 * check locally if the full hash suffix appears in the response.
 * Returns the breach count (0 = not found).
 */
export async function isPasswordPwned(password: string): Promise<number> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const res = await fetch(`${HIBP_API}/${prefix}`, {
    headers: {
      "Add-Padding": "true",
      "User-Agent": "saas-app-hibp-check",
    },
  });

  if (!res.ok) {
    throw new Error(`HIBP API returned ${res.status}`);
  }

  const text = await res.text();
  for (const line of text.split("\r\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    if (line.slice(0, sep) === suffix) {
      return parseInt(line.slice(sep + 1), 10);
    }
  }
  return 0;
}
