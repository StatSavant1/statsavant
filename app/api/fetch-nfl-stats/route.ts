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
    // remove accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // remove anything in parentheses (team/position notes)
    .replace(/\(.*?\)/g, "")
    // remove apostrophes/periods/commas
    .replace(/['’.]/g, "")
    .replace(/,/g, "")
    // remove common suffixes
    .replace(/\s+(jr|sr|ii|iii|iv)$/i, "")
    // remove trailing team abbreviations after dash (e.g. "breece hall - nyj")
    .replace(/\s*[-–—]\s*[a-z]{2,4}\b/g, "")
    // collapse spaces
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMarket(market: string | null): string {
  return market ? market.toLowerCase().trim() : "";
}

function toNumber(val: number | string | null): number | null {
  if (val === null || val === undefined) return null;

  // handle "-" or "" from sheets
  if (typeof val === "string") {
    const t = val.trim();
    if (!t || t === "-" || t.toLowerCase() === "null") return null;
  }

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

    // 1) Pull props
    const { data: props, error: propsErr } = await supabase
      .from("nfl_player_props_latest")
      .select("player, market, point, home_team, away_team, commence_time");

    if (propsErr) throw new Error(propsErr.message);

    // 2) Pull stats
    const { data: stats, error: statsErr } = await supabase
      .from("nfl_recent_stats_all")
      .select("*");

    if (statsErr) throw new Error(statsErr.message);

    if (!props || !stats) {
      return NextResponse.json({ success: true, stats: [] });
    }

    // 3) Build stats lookup map (keyed by normalized player + market)
    const statsMap = new Map<string, StatRow>();
    for (const s of stats as StatRow[]) {
      if (!s.player || !s.market) continue;
      const key = `${normalizeName(s.player)}-${normalizeMarket(s.market)}`;
      statsMap.set(key, s);
    }

    // 4) Deduplicate props (latest commence_time wins)
    const propMap = new Map<string, PropRow>();

    for (const p of props as PropRow[]) {
      if (!p.player || !p.market) continue;

      const key = `${normalizeName(p.player)}-${normalizeMarket(p.market)}`;
      const existing = propMap.get(key);

      if (!existing) {
        propMap.set(key, p);
        continue;
      }

      if (toDateMs(p.commence_time) > toDateMs(existing.commence_time)) {
        propMap.set(key, p);
      }
    }

    // 5) Merge props + stats (with diagnostics)
    let missingStatCount = 0;
    const missingByMarket: Record<string, number> = {};

    const merged = Array.from(propMap.values()).map((prop) => {
      const player = prop.player?.trim() || null;
      const market = normalizeMarket(prop.market);

      const key = `${normalizeName(player)}-${market}`;
      const stat = statsMap.get(key);

      if (!stat) {
        missingStatCount++;
        missingByMarket[market] = (missingByMarket[market] ?? 0) + 1;
      }

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
    console.log("⚠️ NFL MISSING STAT COUNT:", missingStatCount);
    console.log("⚠️ NFL MISSING BY MARKET:", missingByMarket);

    return NextResponse.json({ success: true, stats: merged });
  } catch (err: any) {
    console.error("💥 NFL API ERROR:", err?.message || err);
    return NextResponse.json(
      { success: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}











