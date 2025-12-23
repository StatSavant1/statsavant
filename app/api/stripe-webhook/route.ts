export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        stripe_subscription_id: session.subscription,
      })
      .eq("id", session.metadata.user_id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription: any = event.data.object;

    await supabase
      .from("profiles")
      .update({ subscription_status: "inactive" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}






