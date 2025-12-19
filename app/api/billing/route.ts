import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect("/login");
    }

    // ✅ FIX: query by profiles.id (not user_id)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (error || !profile?.stripe_customer_id) {
      throw new Error("Missing stripe_customer_id");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error("🔥 BILLING ERROR:", err);
    return new NextResponse("Billing error", { status: 500 });
  }
}



