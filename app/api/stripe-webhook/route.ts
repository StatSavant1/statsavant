export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-10-29.clover",
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  /* ================================
     ✅ CHECKOUT COMPLETED
  ================================= */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.supabase_user_id;
    const plan = session.metadata?.plan;

    if (!userId || !session.subscription) {
      console.error("❌ Missing metadata on checkout session", session.id);
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        is_subscriber: true,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        plan_type: plan,
      })
      .eq("id", userId);
  }

  /* ================================
     🔄 SUBSCRIPTION UPDATED
  ================================= */
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabase
      .from("profiles")
      .update({
        subscription_status: subscription.status,
        is_subscriber: subscription.status === "active",
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  /* ================================
     ❌ SUBSCRIPTION CANCELED
  ================================= */
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabase
      .from("profiles")
      .update({
        subscription_status: "inactive",
        is_subscriber: false,
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}








