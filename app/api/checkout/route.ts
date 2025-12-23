import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServerClient } from "@/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

function getPriceId(plan: string) {
  if (plan === "founder") return process.env.STRIPE_PRICE_FOUNDER!;
  if (plan === "monthly") return process.env.STRIPE_PRICE_MONTHLY!;
  if (plan === "yearly") return process.env.STRIPE_PRICE_YEARLY!;
  return null;
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const priceId = getPriceId(plan);

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await supabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/account?checkout=success`,
      cancel_url: `${siteUrl}/subscribe?checkout=cancel`,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        plan_type: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}





