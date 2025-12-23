export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // ✅ Stripe initialized INSIDE handler (critical)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-10-29.clover",
    });

    const { plan } = await req.json();

    const PRICE_MAP: Record<string, string | undefined> = {
      founder: process.env.STRIPE_PRICE_FOUNDER,
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_YEARLY,
    };

    const priceId = PRICE_MAP[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
















