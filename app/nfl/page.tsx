"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ---- Supabase client (public anon for client-side reads)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Light typings; we’ll keep stats as `any` because sheet columns include keys like "1" and "cover_%_l5"
type PlayerProp = {
  description: string | null; // player name
  home_team: string | null;
  away_team: string | null;
  market: string | null; // e.g. "player_pass_yds"
  label: string | null;  // "Over" | "Under"
  price: number | null;
  point: number | null;
};

export default function NFLPage() {
  const [propsData, setPropsData] = useState<PlayerProp[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]); // qb + rb + wr recent stats merged
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ------------ Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: props, error: propsErr }, qb, rb, wr] = await Promise.all([
          supabase.from("nfl_player_props").select("*"),
          supabase.from("nfl_qb_recent_stats").select("*"),
          supabase.from("nfl_rb_recent_stats").select("*"),
          supabase.from("nfl_wr_recent_stats").select("*"),
        ]);

        if (propsErr || qb.error || rb.error || wr.error) {
          console.error("Supabase fetch error:", propsErr || qb.error || rb.error || wr.error);
          setError("Error loading data from Supabase.");
          return;
        }

        setPropsData((props || []) as PlayerProp[]);
        setStatsData([...(qb.data || []), ...(rb.data || []), ...(wr.data || [])]);
      } catch (e: any) {
        console.error("Unexpected fetch error:", e?.message || e);
        setError("Unexpected error loading data.");
      }
    };

    fetchAll();
  }, []);

  // ------------ Helper: find stats for a player (case-insensitive exact match)
  const getStatsForPlayer = (playerName: string | null) => {
    if (!playerName) return undefined;
    const key = playerName.trim().toLowerCase();
    return statsData.find((s) => (s.player_name || "").trim().toLowerCase() === key);
  };

  // ------------ Group props by player
  const groupedByPlayer: Record<string, PlayerProp[]> = propsData.reduce(
    (acc: Record<string, PlayerProp[]>, p) => {
      const name = (p.description || "Unknown").trim();
      if (!acc[name]) acc[name] = [];
      acc[name].push(p);
      return acc;
    },
    {}
  );

  // ------------ Filtered player list from search
  const filteredPlayers = Object.keys(groupedByPlayer).filter((player) =>
    player.toLowerCase().includes(search.toLowerCase())
  );

  // ------------ Friendly market label
  const marketLabel = (market: string | null) => {
    if (!market) return "";
    if (market.includes("pass")) return "Passing Yards";
    if (market.includes("rush")) return "Rushing Yards";
    if (market.includes("rec")) return "Receiving Yards";
    return market;
  };

  // ------------ Render
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-green-400">
        NFL Player Props
      </h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {error ? (
        <p className="text-center text-red-400">{error}</p>
      ) : filteredPlayers.length === 0 ? (
        <p className="text-center text-gray-400">No players found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const playerProps = groupedByPlayer[player];

            // Keep only ONE entry per market (use the "Over" entry to carry the line)
            const uniqueMarketsObj: Record<string, PlayerProp> = playerProps.reduce(
              (acc: Record<string, PlayerProp>, prop: PlayerProp) => {
                const key = prop.market || "";
                if (key && prop.label === "Over" && !acc[key]) acc[key] = prop;
                return acc;
              },
              {}
            );
            const uniqueMarkets: PlayerProp[] = Object.values(uniqueMarketsObj);

            const example = playerProps[0]; // to show matchup text
            const stats = getStatsForPlayer(player); // may be undefined

            return (
              <div
                key={player}
                className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 hover:border-green-400 transition"
              >
                <h2 className="text-xl font-semibold text-green-300 mb-1">{player}</h2>
                <p className="text-gray-400 text-sm mb-3">
                  {example?.home_team} vs {example?.away_team}
                </p>

                {uniqueMarkets.map((p, idx) => (
                  <div
                    key={`${player}-${p.market}-${idx}`}
                    className="mb-3 border-t border-gray-800 pt-2 last:border-b-0"
                  >
                    <p className="text-gray-300 font-medium">
                      {marketLabel(p.market)} —{" "}
                      <span className="font-bold">{p.point ?? "-"}</span>
                    </p>

                    {/* Stats block (if we have recent stats for this player) */}
                    {stats ? (
                      <>
                        <p className="text-sm text-gray-400 mb-1">
                          Avg L5: {stats["avg_l_5"] ?? "-"}
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          Cover % L5:{" "}
                          <span
                            className={
                              (Number(stats["cover_%_l5"]) || 0) > 50
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {stats["cover_%_l5"] ?? 0}%
                          </span>
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          Δ Avg to Line:{" "}
                          <span
                            className={
                              (Number(stats["delta_avg_to_line"]) || 0) >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {stats["delta_avg_to_line"] ?? 0}
                          </span>
                        </p>

                        {/* Last 5 Games colored vs line */}
                        <div className="flex gap-1 text-xs mt-2">
                          {["1", "2", "3", "4", "5"].map((k) => {
                            const val = stats[k] as number | null | undefined;
                            const over = val != null && p.point != null && val > p.point;
                            return (
                              <div
                                key={k}
                                className={`px-2 py-1 rounded ${
                                  over
                                    ? "bg-green-700 text-green-100"
                                    : "bg-red-700 text-red-100"
                                }`}
                              >
                                {val ?? "-"}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">
                        No recent game stats available.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
