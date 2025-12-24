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
    const { plan } = await req.json();

    // 🔍 DEBUG: confirm plan value
    console.log("🧪 PLAN DEBUG:", plan);

    // 🔍 DEBUG: confirm env vars at runtime
    console.log("🧪 PRICE_MAP DEBUG:", {
      founder: process.env.STRIPE_PRICE_FOUNDER,
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_YEARLY,
    });

    const priceId = PRICE_MAP[plan as keyof typeof PRICE_MAP];

    if (!priceId) {
      console.error("❌ INVALID PLAN OR PRICE ID", {
        plan,
        priceMap: PRICE_MAP,
      });

      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    // ✅ Stripe initialized at runtime
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
    console.error("💥 CHECKOUT ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}




















