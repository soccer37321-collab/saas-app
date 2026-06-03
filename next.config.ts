import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "battery=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  },
  // Cross-Origin policies
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // CSP — Note: 'unsafe-inline' for scripts is required by Next.js hydration.
  // Nonce-based CSP would be the strict alternative but requires middleware changes.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js hydration requires unsafe-inline; Turnstile script from CF
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      // Tailwind inline styles
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs + blob (Next.js Image)
      "img-src 'self' data: blob:",
      // API calls: Supabase + HIBP (browser) + Turnstile
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.pwnedpasswords.com https://challenges.cloudflare.com",
      // Turnstile renders in an iframe
      "frame-src https://challenges.cloudflare.com",
      // Geist font is self-hosted by next/font
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      // Stripe checkout is a redirect, not a form post to external
      "form-action 'self'",
      // Prevent this page from being framed anywhere
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Never expose source maps to the browser in production
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
