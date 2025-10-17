import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Environment variables (keep private)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch all player props
    const { data: props, error: propsError } = await supabase
      .from("nfl_player_props")
      .select("*")
      .order("description", { ascending: true });

    if (propsError) throw propsError;

    // Fetch all recent stats tables (QB, RB, WR)
    const tables = [
      "nfl_qb_recent_stats",
      "nfl_rb_recent_stats",
      "nfl_wr_recent_stats",
    ];

    let allStats: any[] = [];
    for (const table of tables) {
      const { data: stats, error } = await supabase.from(table).select("*");
      if (error) throw error;
      allStats = [...allStats, ...stats];
    }

    // Merge by player (description = player)
    const merged = props.map((prop) => {
      const playerName = (prop.description || "").trim();
      const stats = allStats.find(
        (s) => s.player?.toLowerCase() === playerName.toLowerCase()
      );

      return {
        player: playerName,
        team: prop.home_team || prop.away_team || "",
        market: prop.market,
        point: prop.point,
        price: prop.price,
        cover_last5: stats?.["cover_%_l5"] ?? null,
        avg_last5: stats?.avg_l_5 ?? null,
        delta_to_line: stats?.delta_avg_to_line ?? null,
        last5: [stats?.g1, stats?.g2, stats?.g3, stats?.g4, stats?.g5].filter(
          (v) => v !== null && v !== undefined
        ),
      };
    });

    return NextResponse.json({ success: true, players: merged });
  } catch (err: any) {
    console.error("fetch-nfl-stats error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}



