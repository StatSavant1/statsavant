export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/* =======================
   API Handler
======================= */

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("nfl_props_with_stats")
      .select(
        `
        player,
        market,
        line,
        last_five,
        avg_l5,
        updated_at,
        home_team,
        away_team,
        commence_time
        `
      );

    if (error) {
      console.error("❌ SUPABASE VIEW ERROR:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: data ?? [],
    });

  } catch (err: any) {
    console.error("💥 NFL API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}




















