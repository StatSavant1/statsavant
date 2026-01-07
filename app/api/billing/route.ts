import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServerClient();

    /* ===========================
       AUTH CHECK
    =========================== */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login`
      );
    }

    /* ===========================
       FETCH STRIPE CUSTOMER ID
    =========================== */
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (error || !profile?.stripe_customer_id) {
      throw new Error("Missing stripe_customer_id");
    }

    /* ===========================
       STRIPE CLIENT
    =========================== */
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-10-29.clover",
    });

    /* ===========================
       SAFE RETURN URL (CRITICAL)
    =========================== */
    const returnUrl = new URL(
      "/account",
      process.env.NEXT_PUBLIC_SITE_URL!
    ).toString();

    /* ===========================
       CREATE BILLING PORTAL SESSION
    =========================== */
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error("🔥 BILLING ERROR:", err);
    return new NextResponse("Billing error", { status: 500 });
  }
}




