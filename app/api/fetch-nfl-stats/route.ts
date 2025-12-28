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

  // passing
  g1?: number | string | null;
  g2?: number | string | null;
  g3?: number | string | null;
  g4?: number | string | null;
  g5?: number | string | null;

  // rushing
  r1?: number | string | null;
  r2?: number | string | null;
  r3?: number | string | null;
  r4?: number | string | null;
  r5?: number | string | null;

  // receiving
  rec1?: number | string | null;
  rec2?: number | string | null;
  rec3?: number | string | null;
  rec4?: number | string | null;
  rec5?: number | string | null;

  avg_l5?: number | string | null;
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
  return market ? market.toLowerCase().trim() : "";
}

function toNumber(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function toDateMs(iso: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function getLastFive(stat: StatRow | undefined, market: string): number[] {
  if (!stat) return [];

  let raw: (number | string | null | undefined)[] = [];

  if (market === "player_pass_yds") {
    raw = [stat.g1, stat.g2, stat.g3, stat.g4, stat.g5];
  } else if (market === "player_rush_yds") {
    raw = [stat.r1, stat.r2, stat.r3, stat.r4, stat.r5];
  } else if (market === "player_reception_yds") {
    raw = [stat.rec1, stat.rec2, stat.rec3, stat.rec4, stat.rec5];
  }

  return raw.map(toNumber).filter((v): v is number => v !== null);
}

/* =======================
   API Handler
======================= */

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: props } = await supabase
      .from("nfl_player_props_latest")
      .select("player, market, point, home_team, away_team, commence_time");

    const { data: stats } = await supabase
      .from("nfl_recent_stats_all")
      .select("*");

    if (!props || !stats) {
      return NextResponse.json({ success: true, stats: [] });
    }

    const statsMap = new Map<string, StatRow>();
    for (const s of stats as StatRow[]) {
      if (!s.player || !s.market) continue;
      const key = `${normalizeName(s.player)}-${normalizeMarket(s.market)}`;
      statsMap.set(key, s);
    }

    const propMap = new Map<string, PropRow>();
    for (const p of props as PropRow[]) {
      if (!p.player || !p.market) continue;

      const key = `${normalizeName(p.player)}-${normalizeMarket(p.market)}`;
      const existing = propMap.get(key);

      if (!existing || toDateMs(p.commence_time) > toDateMs(existing.commence_time)) {
        propMap.set(key, p);
      }
    }

    const merged = Array.from(propMap.values()).map((prop) => {
      const player = prop.player?.trim() || null;
      const market = normalizeMarket(prop.market);
      const key = `${normalizeName(player)}-${market}`;
      const stat = statsMap.get(key);

      return {
        player,
        market,
        line: typeof prop.point === "number" ? prop.point : null,
        last_five: getLastFive(stat, market),
        avg_l5: toNumber(stat?.avg_l5 ?? null),
        updated_at: stat?.updated_at ?? null,
        home_team: prop.home_team,
        away_team: prop.away_team,
        commence_time: prop.commence_time,
      };
    });

    return NextResponse.json({ success: true, stats: merged });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}









