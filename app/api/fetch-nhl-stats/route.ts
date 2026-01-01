import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Server-side NOW() reference (UTC, safe)
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("nhl_props_with_stats_mv")
      .select(`
        player,
        market,
        line,
        last_ten,
        avg_l10,
        updated_at,
        home_team,
        away_team,
        commence_time
      `)
      .gte("commence_time", nowIso)
      .order("commence_time", { ascending: true })
      .order("player", { ascending: true });

    if (error) {
      console.error("❌ SUPABASE NHL VIEW ERROR:", error);
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
    console.error("💥 NHL API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}






