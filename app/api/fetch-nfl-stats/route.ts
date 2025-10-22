import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ 1. Player prop lines
    const { data: props, error: propsError } = await supabase
      .from("nfl_player_props_latest")
      .select("*");

    if (propsError) throw propsError;

    // ✅ 2. Pull recent stats from all sources
    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select("*"),
      supabase.from("nfl_rb_recent_stats").select("*"),
      supabase.from("nfl_wr_recent_stats").select("*"),
    ]);

    if (qb.error || rb.error || wr.error)
      throw qb.error || rb.error || wr.error;

    // ✅ 3. Merge and normalize data
    const normalize = (row: any) => ({
      player: row.player,
      g1: row["1"] ?? null,
      g2: row["2"] ?? null,
      g3: row["3"] ?? null,
      g4: row["4"] ?? null,
      g5: row["5"] ?? null,
      cover_%_l5: row["cover_%_l5"] ?? null,
      avg_l_5: row.avg_l_5 ?? null,
      delta_avg_to_line: row.delta_avg_to_line ?? null,
      updated_at: row.updated_at ?? null,
    });

    const recentStats = [
      ...(qb.data || []).map(normalize),
      ...(rb.data || []).map(normalize),
      ...(wr.data || []).map(normalize),
    ];

    // ✅ 4. Return everything
    return NextResponse.json({
      success: true,
      stats: props,
      recentStats,
    });
  } catch (error: any) {
    console.error("Fetch NFL Stats Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}








