export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/* =======================
   Types
======================= */

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
  g1: number | string | null;
  g2: number | string | null;
  g3: number | string | null;
  g4: number | string | null;
  g5: number | string | null;
  avg_l5: number | string | null;
  updated_at?: string | null;
};

/* =======================
   Helpers
======================= */

function normalizeName(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/\s+(jr|sr|ii|iii|iv)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMarket(market: string | null): string {
  if (!market) return "";
  return market
    .toLowerCase()
    .replace(/[^a-z_]/g, "")
    .trim();
}

function toNumber(val: number | string | null): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

function toDateMs(iso: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

/* =======================
   API Handler
======================= */

export async function GET() {
  console.log("🔥 NFL API HIT");

  try {
    const supabase = getSupabaseAdmin();

    /* -----------------------
       Pull props
    ----------------------- */
    const { data: props } = await supabase
      .from("nfl_player_props_latest")
      .select("player, market, point, home_team, away_team, commence_time");

    /* -----------------------
       Pull stats
    ----------------------- */
    const { data: stats } = await supabase
      .from("nfl_recent_stats_all")
      .select("player, market, g1, g2, g3, g4, g5, avg_l5, updated_at");

    if (!props || !stats) {
      return NextResponse.json({ success: true, stats: [] });
    }

    /* -----------------------
       Build statsMap (FIXED)
    ----------------------- */
    const statsMap = new Map<string, StatRow>();

    for (const s of stats as StatRow[]) {
      if (!s.player || !s.market) continue;

      const hasAnyGame =
        [s.g1, s.g2, s.g3, s.g4, s.g5]
          .map(v => Number(v))
          .some(v => !Number.isNaN(v));

      if (!hasAnyGame) continue;

      const key = `${normalizeName(s.player)}-${normalizeMarket(s.market)}`;
      const existing = statsMap.get(key);

      if (!existing) {
        statsMap.set(key, s);
        continue;
      }

      if (toDateMs(s.updated_at ?? null) > toDateMs(existing.updated_at ?? null)) {
        statsMap.set(key, s);
      }
    }

    /* -----------------------
       Deduplicate props
    ----------------------- */
    const propMap = new Map<string, PropRow>();

    for (const p of props as PropRow[]) {
      if (!p.player || !p.market) continue;

      const key = `${normalizeName(p.player)}-${normalizeMarket(p.market)}`;
      const existing = propMap.get(key);

      if (!existing || toDateMs(p.commence_time) > toDateMs(existing.commence_time)) {
        propMap.set(key, p);
      }
    }

    /* -----------------------
       Merge
    ----------------------- */
    const merged = Array.from(propMap.values()).map((prop) => {
      const player = prop.player?.trim() || null;
      const market = normalizeMarket(prop.market);
      const key = `${normalizeName(player)}-${market}`;
      const stat = statsMap.get(key);

      const last_five = stat
        ? [stat.g1, stat.g2, stat.g3, stat.g4, stat.g5]
            .map(toNumber)
            .filter((v): v is number => v !== null)
        : [];

      return {
        player,
        market,
        line: typeof prop.point === "number" ? prop.point : null,
        last_five,
        avg_l5: toNumber(stat?.avg_l5 ?? null),
        updated_at: stat?.updated_at ?? null,
        home_team: prop.home_team,
        away_team: prop.away_team,
        commence_time: prop.commence_time,
      };
    });

    console.log("✅ NFL MERGED COUNT:", merged.length);

    return NextResponse.json({
      success: true,
      stats: merged,
    });

  } catch (err: any) {
    console.error("💥 NFL API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}



















