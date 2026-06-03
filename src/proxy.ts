import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/settings", "/org"];
const AUTH_ROUTES      = ["/auth/login", "/auth/register"];
const isProd           = process.env.NODE_ENV === "production";

/** Origins allowed to call our API from a browser. */
function isAllowedOrigin(origin: string): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const allowed = new Set([appUrl, "http://localhost:3000", "http://localhost:3001"]);
  return allowed.has(origin);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── API routes: CORS check only (skip expensive Supabase session call) ──
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    // Stripe webhook is server-to-server — no Origin header, always pass through
    const isWebhook = pathname.startsWith("/api/stripe/webhook");
    if (origin && !isWebhook && !isAllowedOrigin(origin)) {
      return new NextResponse("Forbidden", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
    return NextResponse.next();
  }

  // ── Page routes: full session check + route protection ──
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              secure: isProd ? true : options?.secure,
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAuthPage  = AUTH_ROUTES.some(r => pathname.startsWith(r));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Include API routes for CORS checking; exclude only static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
