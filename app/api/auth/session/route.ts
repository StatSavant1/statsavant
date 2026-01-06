import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  /* ===========================
     AUTH SESSION
  =========================== */
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData.session?.user) {
    return NextResponse.json({ user: null });
  }

  /* ===========================
     SUBSCRIPTION HYDRATION
  =========================== */
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_subscriber, plan_type, subscription_status")
    .eq("id", sessionData.session.user.id)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }

  return NextResponse.json({
    user: sessionData.session.user,
    subscription: profile ?? null,
  });
}



