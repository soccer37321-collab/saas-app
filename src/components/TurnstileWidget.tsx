"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, opts: {
        sitekey: string;
        callback(token: string): void;
        "expired-callback"?(): void;
        "error-callback"?(): void;
      }): string;
      reset(widgetId: string): void;
      remove(widgetId: string): void;
    };
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
}

export default function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const init = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
      callback: onToken,
      "expired-callback": onExpire,
      "error-callback": onExpire,
    });
  }, [onToken, onExpire]);

  useEffect(() => {
    // Script may already be loaded (e.g. navigating between pages)
    init();
    return () => {
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [init]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={init}
      />
      <div ref={containerRef} />
    </>
  );
}
