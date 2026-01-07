import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServerClient();

  /* ===========================
     AUTH CHECK
  =========================== */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        user: null,
        subscription_status: "inactive",
        plan_type: null,
        next_billing_date: null,
      },
      { status: 200 }
    );
  }

  /* ===========================
     FETCH PROFILE
  =========================== */
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "email, subscription_status, plan_type, stripe_subscription_id"
    )
    .eq("id", user.id)
    .single();

  let nextBillingDate: string | null = null;

  /* ===========================
     FETCH STRIPE SUBSCRIPTION
  =========================== */
  if (profile?.stripe_subscription_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-10-29.clover",
      });

      const subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      );

      // ✅ TYPE GUARD — required for Stripe TS union
      if (
        "current_period_end" in subscription &&
        typeof subscription.current_period_end === "number"
      ) {
        nextBillingDate = new Date(
          subscription.current_period_end * 1000
        ).toISOString();
      }
    } catch (err) {
      console.error(
        "⚠️ Unable to fetch Stripe subscription:",
        err
      );
    }
  }

  return NextResponse.json(
    {
      user_id: user.id,
      email: profile?.email ?? user.email,
      subscription_status: profile?.subscription_status ?? "inactive",
      plan_type: profile?.plan_type ?? null,
      stripe_subscription_id:
        profile?.stripe_subscription_id ?? null,
      next_billing_date: nextBillingDate,
    },
    { status: 200 }
  );
}






