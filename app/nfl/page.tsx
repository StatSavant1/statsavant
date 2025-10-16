"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface PlayerProp {
  description: string | null; // player name
  home_team: string | null;
  away_team: string | null;
  market: string | null;
  label: string | null;
  price: number | null;
  point: number | null;
}

interface PlayerStat {
  player: string | null;
  team: string | null;
  game_1: number | null;
  game_2: number | null;
  game_3: number | null;
  game_4: number | null;
  game_5: number | null;
  avg_l_5: number | null;
  cover_percent_l5: number | null;
  delta_avg_to_line: number | null;
}

export default function NFLPage() {
  const [propsData, setPropsData] = useState<PlayerProp[]>([]);
  const [statsData, setStatsData] = useState<PlayerStat[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Player Props
        const { data: props, error: propsErr } = await supabase
          .from("nfl_player_props")
          .select("*")
          .order("description", { ascending: true });

        // Recent Stats
        const { data: stats, error: statsErr } = await supabase
          .from("nfl_qb_recent_stats")
          .select("*")
          .order("player", { ascending: true });

        if (propsErr || statsErr) {
          console.error("Supabase fetch error:", propsErr || statsErr);
          setError("Error loading data from Supabase.");
        } else {
          setPropsData(props || []);
          setStatsData(stats || []);
        }
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError("Unexpected error loading data.");
      }
    };
    fetchData();
  }, []);

  // Helper to find stats by player name
  const getStatsForPlayer = (player: string | null) =>
    statsData.find(
      (s) => s.player?.trim().toLowerCase() === player?.trim().toLowerCase()
    );

  // Group props by player
  const grouped = propsData.reduce((acc: any, item) => {
    const key = item.description || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const filteredPlayers = Object.keys(grouped).filter((player) =>
    player.toLowerCase().includes(search.toLowerCase())
  );

  const marketLabel = (market: string | null) => {
    if (!market) return "";
    if (market.includes("pass")) return "Passing Yards";
    if (market.includes("rush")) return "Rushing Yards";
    if (market.includes("rec")) return "Receiving Yards";
    return market;
  };

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
            // show one line per market (Over only)
            const uniqueMarkets = Object.values(
              grouped[player].reduce((acc: any, prop: PlayerProp) => {
                const key = prop.market;
                if (!acc[key] && prop.label === "Over") acc[key] = prop;
                return acc;
              }, {})
            ) as PlayerProp[];

            const stats = getStatsForPlayer(player);

            return (
              <div
                key={player}
                className="bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800 hover:border-green-400 transition"
              >
                <h2 className="text-xl font-semibold text-green-300 mb-1">
                  {player}
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  {grouped[player][0]?.home_team} vs{" "}
                  {grouped[player][0]?.away_team}
                </p>

                {uniqueMarkets.map((prop, idx) => (
                  <div
                    key={idx}
                    className="mb-3 border-t border-gray-800 pt-2 last:border-b-0"
                  >
                    <p className="text-gray-300 font-medium">
                      {marketLabel(prop.market)} —{" "}
                      <span className="font-bold">{prop.point ?? "-"}</span>
                    </p>

                    {stats && (
                      <>
                        <p className="text-sm text-gray-400 mb-1">
                          Avg L5: {stats.avg_l_5 ?? "-"} yds
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          Cover %:{" "}
                          <span
                            className={
                              (stats.cover_percent_l5 ?? 0) > 50
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {stats.cover_percent_l5 ?? 0}%
                          </span>
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                          Δ Avg to Line:{" "}
                          <span
                            className={
                              (stats.delta_avg_to_line ?? 0) > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {stats.delta_avg_to_line ?? 0}
                          </span>
                        </p>

                        {/* Last 5 games trend bar */}
                        <div className="flex gap-1 text-xs mt-2">
                          {[
                            stats.game_1,
                            stats.game_2,
                            stats.game_3,
                            stats.game_4,
                            stats.game_5,
                          ].map((val, i) => (
                            <div
                              key={i}
                              className={`px-2 py-1 rounded ${
                                val && prop.point && val > prop.point
                                  ? "bg-green-700 text-green-100"
                                  : "bg-red-700 text-red-100"
                              }`}
                            >
                              {val ?? "-"}
                            </div>
                          ))}
                        </div>
                      </>
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


