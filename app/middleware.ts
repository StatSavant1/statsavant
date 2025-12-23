import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = ["/nfl/full", "/nba/full", "/nhl/full"];

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", session.user.id)
      .single();

    if (profile?.subscription_status !== "active") {
      return NextResponse.redirect(new URL("/subscribe", req.url));
    }
  }

  return res;
}

/**
 * 🔑 CRITICAL FIX
 * Exclude Stripe + API routes from Supabase middleware
 */
export const config = {
  matcher: [
    // App pages ONLY
    "/nfl/:path*",
    "/nba/:path*",
    "/nhl/:path*",

    // ❌ EXCLUDE ALL API ROUTES
    "!/api/:path*",
  ],
};

