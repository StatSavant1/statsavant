import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        user: null,
        subscription_status: "inactive",
        plan_type: null,
      },
      { status: 200 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, subscription_status, plan_type, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  return NextResponse.json(
    {
      user_id: user.id,
      email: profile?.email ?? user.email,
      subscription_status: profile?.subscription_status ?? "inactive",
      plan_type: profile?.plan_type ?? null,
      stripe_subscription_id: profile?.stripe_subscription_id ?? null,
    },
    { status: 200 }
  );
}



