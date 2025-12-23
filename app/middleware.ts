import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: any) {
  const pathname = req.nextUrl.pathname;

  // 🚫 ABSOLUTE EXCLUSION
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.delete(name);
        },
      },
    }
  );

  // 🔒 Only protect actual pages
  const protectedRoutes = ["/nfl", "/nba", "/nhl"];

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

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

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};


