import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ Columns to select from trend tables
    const selectQuery = `
      player,
      g1,
      g2,
      g3,
      g4,
      g5,
      "cover_%_l5",
      avg_l_5,
      delta_avg_to_line,
      updated_at
    `;

    // ✅ Pull all trend data (QB/RB/WR)
    const [qb, rb, wr] = await Promise.all([
      supabase.from("nfl_qb_recent_stats").select(selectQuery),
      supabase.from("nfl_rb_recent_stats").select(selectQuery),
      supabase.from("nfl_wr_recent_stats").select(selectQuery),
    ]);

    if (qb.error || rb.error || wr.error) {
      return NextResponse.json(
        { success: false, error: qb.error?.message || rb.error?.message || wr.error?.message },
        { status: 500 }
      );
    }

    const allTrends = [
      ...(qb.data ?? []),
      ...(rb.data ?? []),
      ...(wr.data ?? []),
    ];

    // ✅ Pull current player prop lines
    const propsRes = await supabase
      .from("nfl_player_props_latest")
      .select("description, market, point")
      .not("point", "is", null);

    if (propsRes.error) {
      console.error("Error fetching props:", propsRes.error);
      return NextResponse.json({ success: false, error: propsRes.error.message }, { status: 500 });
    }

    const propsMap = new Map<string, number>();
    propsRes.data.forEach((p) => {
      if (p.description && !propsMap.has(p.description.toLowerCase())) {
        propsMap.set(p.description.toLowerCase(), p.point);
      }
    });

    // ✅ Merge recent stats with latest line
    const merged = allTrends.map((row: any) => ({
      ...row,
      cover_pct_l5: row["cover_%_l5"] ?? null,
      current_line: propsMap.get(row.player?.toLowerCase() || "") ?? null,
    }));

    return NextResponse.json({
      success: true,
      count: merged.length,
      stats: merged,
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}





















