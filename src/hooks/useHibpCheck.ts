"use client";

import { useState, useCallback, useRef } from "react";

const HIBP_API = "https://api.pwnedpasswords.com/range";
const DEBOUNCE_MS = 600;

async function sha1Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function fetchPwnCount(password: string): Promise<number> {
  const hash   = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(`${HIBP_API}/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!res.ok) return 0; // Fail open on API error

  for (const line of (await res.text()).split("\r\n")) {
    const sep = line.indexOf(":");
    if (sep !== -1 && line.slice(0, sep) === suffix) {
      return parseInt(line.slice(sep + 1), 10);
    }
  }
  return 0;
}

export type HibpStatus = "idle" | "checking" | "safe" | "pwned";

export function useHibpCheck() {
  const [status, setStatus]     = useState<HibpStatus>("idle");
  const [pwnCount, setPwnCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback((password: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (password.length < 8) {
      setStatus("idle");
      setPwnCount(0);
      return;
    }

    setStatus("checking");
    timerRef.current = setTimeout(async () => {
      try {
        const count = await fetchPwnCount(password);
        setPwnCount(count);
        setStatus(count > 0 ? "pwned" : "safe");
      } catch {
        // Network error → fail open (don't block the user)
        setStatus("idle");
      }
    }, DEBOUNCE_MS);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("idle");
    setPwnCount(0);
  }, []);

  return { status, pwnCount, check, reset };
}
