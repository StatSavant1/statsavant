import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1️⃣ Fetch recent stats
    const { data: stats, error: statsError } = await supabase
      .from("nfl_recent_stats_all")
      .select("*");

    if (statsError) throw new Error(statsError.message);

    // 2️⃣ Fetch latest lines
    const { data: lines, error: linesError } = await supabase
      .from("nfl_player_props_latest")
      .select("*");

    if (linesError) throw new Error(linesError.message);

    // 3️⃣ Merge by player + market
    const merged = stats.map((row) => {
      const lineRow = lines.find(
        (l: any) =>
          l.player.trim().toLowerCase() === row.player.trim().toLowerCase() &&
          l.market.trim().toLowerCase() === row.market.trim().toLowerCase()
      );

      return {
        player: row.player,
        market: row.market,
        line: lineRow ? Number(lineRow.point) : null,
        avg_l_5: row.avg_l5 ?? null,
        updated_at: row.updated_at ?? null,
        g1: row.g1,
        g2: row.g2,
        g3: row.g3,
        g4: row.g4,
        g5: row.g5,
      };
    });

    return NextResponse.json({
      success: true,
      stats: merged,
      count: merged.length,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}












