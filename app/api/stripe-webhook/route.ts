export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  // ✅ CREATE STRIPE CLIENT AT RUNTIME ONLY
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-10-29.clover",
  });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // ✅ SUBSCRIPTION ACTIVATED
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        stripe_subscription_id: session.subscription,
        plan_type: session.metadata?.plan_type ?? null,
      })
      .eq("id", session.metadata?.user_id);
  }

  // ❌ SUBSCRIPTION CANCELED
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabase
      .from("profiles")
      .update({
        subscription_status: "inactive",
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}





