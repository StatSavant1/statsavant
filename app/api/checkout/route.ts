export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";

/* =======================
   Price Map
======================= */

const PRICE_MAP = {
  founder: process.env.STRIPE_PRICE_FOUNDER,
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};

/* =======================
   API Handler
======================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body?.plan;

    // 🔍 RUNTIME DEBUG (do NOT remove yet)
    console.log("🧾 Checkout plan received:", plan);
    console.log("💳 Stripe price env check:", {
      founder: process.env.STRIPE_PRICE_FOUNDER,
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_YEARLY,
    });

    if (!plan || typeof plan !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid plan" },
        { status: 400 }
      );
    }

    const priceId = PRICE_MAP[plan as keyof typeof PRICE_MAP];

    console.log("✅ Resolved Stripe price ID:", priceId);

    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    // ✅ Stripe initialized ONLY at runtime
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-10-29.clover",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("💥 Checkout route error:", err);
    return NextResponse.json(
      { error: err?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}


















