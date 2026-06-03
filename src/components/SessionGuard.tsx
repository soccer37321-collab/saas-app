"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INACTIVITY_MS   = 30 * 60 * 1000;      // 30 minutes
const MAX_SESSION_MS  = 24 * 60 * 60 * 1000;  // 24 hours
const CHECK_INTERVAL  = 30 * 1000;            // check every 30 s
const WRITE_THROTTLE  = 10 * 1000;            // throttle localStorage writes to 10 s

export function sessionStartKey(uid: string)  { return `ss_start_${uid}`; }
export function sessionActiveKey(uid: string) { return `ss_active_${uid}`; }

export function clearSessionKeys(uid: string) {
  localStorage.removeItem(sessionStartKey(uid));
  localStorage.removeItem(sessionActiveKey(uid));
}

export default function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let uid: string | null = null;
    let lastWrite = 0;

    const EVENTS = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;

    const handleActivity = () => {
      if (!uid) return;
      const now = Date.now();
      if (now - lastWrite > WRITE_THROTTLE) {
        localStorage.setItem(sessionActiveKey(uid), String(now));
        lastWrite = now;
      }
    };

    const teardown = () => {
      EVENTS.forEach(e => document.removeEventListener(e, handleActivity));
      if (intervalId !== undefined) clearInterval(intervalId);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      uid = user.id;
      const now = Date.now();

      // session_start: set by login page on fresh login; persist across browser restarts
      if (!localStorage.getItem(sessionStartKey(uid))) {
        localStorage.setItem(sessionStartKey(uid), String(now));
      }
      // last_active: always reset on mount so browser-close inactivity doesn't immediately expire
      localStorage.setItem(sessionActiveKey(uid), String(now));
      lastWrite = now;

      EVENTS.forEach(e => document.addEventListener(e, handleActivity, { passive: true }));

      intervalId = setInterval(async () => {
        if (!uid) return;
        const now = Date.now();
        const start  = Number(localStorage.getItem(sessionStartKey(uid))  ?? now);
        const active = Number(localStorage.getItem(sessionActiveKey(uid)) ?? now);

        if (now - active > INACTIVITY_MS) {
          teardown();
          clearSessionKeys(uid);
          await supabase.auth.signOut();
          router.push("/auth/login?reason=inactivity");
        } else if (now - start > MAX_SESSION_MS) {
          teardown();
          clearSessionKeys(uid);
          await supabase.auth.signOut();
          router.push("/auth/login?reason=max_session");
        }
      }, CHECK_INTERVAL);
    });

    return teardown;
  }, [router]);

  return null;
}
