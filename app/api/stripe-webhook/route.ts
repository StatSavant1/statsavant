import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-10-29.clover",
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "active",
        stripe_subscription_id: session.subscription,
        plan_type: session.metadata.plan_type,
      })
      .eq("id", session.metadata.user_id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription: any = event.data.object;

    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "inactive",
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}


