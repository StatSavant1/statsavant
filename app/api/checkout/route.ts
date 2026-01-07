export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// 🔒 Price map
const PRICE_MAP = {
  founder: process.env.STRIPE_PRICE_FOUNDER,
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};

export async function POST(req: Request) {
  try {
    /* ===========================
       SUPABASE AUTH (NEXT 15 SAFE)
    =========================== */
    const cookieStore = await cookies(); // ✅ FIX: await cookies()

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ===========================
       PLAN VALIDATION
    =========================== */
    const { plan } = await req.json();
    const priceId = PRICE_MAP[plan as keyof typeof PRICE_MAP];

    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      );
    }

    /* ===========================
       STRIPE
    =========================== */
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-10-29.clover",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email!,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
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























