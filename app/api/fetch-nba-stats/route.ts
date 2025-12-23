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
  g6: number | string | null;
  g7: number | string | null;
  g8: number | string | null;
  g9: number | string | null;
  g10: number | string | null;
  avg_l10: number | string | null;
  updated_at?: string | null;
};

/* =======================
   Helpers
======================= */

function normalizeName(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’.]/g, "")
    .replace(/\s+(jr|sr|ii|iii|iv)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMarket(market: string | null): string {
  return market ? market.toLowerCase().trim() : "";
}

function toNumber(val: number | string | null): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

/* =======================
   API Handler
======================= */

export async function GET() {
  console.log("🔥 NBA API HIT (ADMIN)");

  try {
    // ✅ CREATE ADMIN CLIENT AT RUNTIME (THIS IS THE KEY)
    const supabase = getSupabaseAdmin();

    /* -----------------------
       Pull ALL NBA props
    ----------------------- */
    const { data: props, error: propsErr } = await supabase
      .from("nba_player_props_latest")
      .select("player, market, point, home_team, away_team, commence_time");

    if (propsErr) throw new Error(propsErr.message);

    /* -----------------------
       Pull recent stats
    ----------------------- */
    const { data: stats, error: statsErr } = await supabase
      .from("nba_recent_stats_all")
      .select("*");

    if (statsErr) throw new Error(statsErr.message);

    if (!props || !stats) {
      return NextResponse.json({ success: true, stats: [] });
    }

    /* -----------------------
       Build stats lookup
    ----------------------- */
    const statsMap = new Map<string, StatRow>();

    for (const s of stats as StatRow[]) {
      if (!s.player || !s.market) continue;
      const key = `${normalizeName(s.player)}-${normalizeMarket(s.market)}`;
      statsMap.set(key, s);
    }

    /* -----------------------
       Deduplicate props
    ----------------------- */
    const propMap = new Map<string, PropRow>();

    for (const p of props as PropRow[]) {
      if (!p.player || !p.market) continue;

      const key = `${normalizeName(p.player)}-${normalizeMarket(p.market)}`;
      const existing = propMap.get(key);

      if (
        !existing ||
        (existing.commence_time &&
          p.commence_time &&
          new Date(p.commence_time) > new Date(existing.commence_time))
      ) {
        propMap.set(key, p);
      }
    }

    /* -----------------------
       Merge props + stats
    ----------------------- */
    const merged = Array.from(propMap.values()).map((prop) => {
      const player = prop.player?.trim() || null;
      const market = normalizeMarket(prop.market);
      const key = `${normalizeName(player)}-${market}`;
      const stat = statsMap.get(key);

      const last_ten = stat
        ? [
            stat.g1,
            stat.g2,
            stat.g3,
            stat.g4,
            stat.g5,
            stat.g6,
            stat.g7,
            stat.g8,
            stat.g9,
            stat.g10,
          ]
            .map(toNumber)
            .filter((v): v is number => v !== null)
        : [];

      return {
        player,
        market,
        line: typeof prop.point === "number" ? prop.point : null,
        last_ten,
        avg_l10: toNumber(stat?.avg_l10),
        updated_at: stat?.updated_at ?? null,
        home_team: prop.home_team,
        away_team: prop.away_team,
        commence_time: prop.commence_time,
      };
    });

    console.log("✅ NBA MERGED COUNT:", merged.length);

    return NextResponse.json({ success: true, stats: merged });
  } catch (err: any) {
    console.error("💥 NBA API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}



























































































































