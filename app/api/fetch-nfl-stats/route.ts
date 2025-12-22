import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PropRow = {
  player: string | null;
  market: string | null;
  point: number | null;
  home_team: string | null;
  away_team: string | null;
  commence_time: string | null;
};

type StatRow = {
  player: string | null;
  market: string | null;
  g1: number | null;
  g2: number | null;
  g3: number | null;
  g4: number | null;
  g5: number | null;
  avg_l5: number | null;
  updated_at?: string | null;
};

function normalizeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+(jr|sr|ii|iii|iv)\s*$/i, "")
    .trim();
}

export async function GET() {
  console.log("🔥 NFL API HIT (ADMIN)");

  try {
    // ✅ ADMIN CLIENT — bypasses RLS
    const supabase = supabaseAdmin;

    // 1) Fetch prop lines
    const { data: props, error: propsErr } = await supabase
      .from("nfl_player_props_latest")
      .select("player, market, point, home_team, away_team, commence_time");

    // 2) Fetch recent stats
    const { data: stats, error: statsErr } = await supabase
      .from("nfl_recent_stats_all")
      .select("*");

    if (propsErr || statsErr) {
      console.error("❌ Supabase error:", propsErr || statsErr);
      return NextResponse.json(
        { success: false, error: propsErr?.message || statsErr?.message },
        { status: 500 }
      );
    }

    if (!props || !stats) {
      return NextResponse.json({ success: true, stats: [] });
    }

    const propsTyped = props as PropRow[];
    const statsTyped = stats as StatRow[];

    // 3) Deduplicate props by player + market
    const propMap = new Map<string, PropRow>();

    for (const prop of propsTyped) {
      const normalizedPlayer = normalizeName(prop.player);
      const key = `${normalizedPlayer}-${prop.market}`;

      if (!propMap.has(key)) {
        propMap.set(key, prop);
      }
    }

    // 4) Merge props + stats
    const merged = Array.from(propMap.values()).map((prop) => {
      const normalizedPlayer = normalizeName(prop.player);

      const stat = statsTyped.find(
        (s) =>
          normalizeName(s.player) === normalizedPlayer &&
          s.market === prop.market
      );

      const raw = stat
        ? [stat.g1, stat.g2, stat.g3, stat.g4, stat.g5]
        : [];

      const last_five = raw.filter(
        (v): v is number => typeof v === "number"
      );

      return {
        player: prop.player,
        market: prop.market,
        line: typeof prop.point === "number" ? prop.point : null,
        last_five,
        avg_l5: stat?.avg_l5 ?? null,
        updated_at: stat?.updated_at ?? null,
        home_team: prop.home_team,
        away_team: prop.away_team,
        commence_time: prop.commence_time,
      };
    });

    console.log("✅ NFL MERGED COUNT:", merged.length);

    return NextResponse.json({ success: true, stats: merged });
  } catch (err: any) {
    console.error("💥 NFL API ROUTE CRASH:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

