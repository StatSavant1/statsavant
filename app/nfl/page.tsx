"use client";

import { useEffect, useState } from "react";

type PlayerProp = {
  description: string | null;
  home_team: string | null;
  away_team: string | null;
  market: string | null;
  label: string | null;
  point: number | null;
};

type PlayerStats = {
  player: string | null;
  "cover_%_l5": number | null;
  "avg_l_5": number | null;
  "delta_avg_to_line": number | null;
  "1"?: number | null;
  "2"?: number | null;
  "3"?: number | null;
  "4"?: number | null;
  "5"?: number | null;
};

const marketLabel = (market: string | null) => {
  switch (market) {
    case "player_pass_yds":
      return "Passing Yards";
    case "player_rush_yds":
      return "Rushing Yards";
    case "player_reception_yds":
      return "Receiving Yards";
    default:
      return "Yards";
  }
};

// Normalize player names (case-insensitive + remove extra spaces)
const normalizeName = (name: string | null | undefined) =>
  (name || "").replace(/\s+/g, " ").trim().toLowerCase();

export default function NFLPage() {
  const [propsData, setPropsData] = useState<PlayerProp[]>([]);
  const [statsData, setStatsData] = useState<PlayerStats[]>([]);
  const [search, setSearch] = useState("");

  import React, { useState, useEffect } from "react";

export default function NFLPage() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/fetch-nfl-stats", { cache: "no-store" });
        const json = await res.json();

        if (json.success) {
          setPlayers(json.stats || []);
        } else {
          console.error("Failed to load player data:", json.error);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold mb-6">NFL Player Props</h1>

      {players.length === 0 ? (
        <p className="text-gray-400">Loading player data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p, i) => (
            <div key={i} className="border border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-1">{p.player}</h2>
              <p className="text-sm text-gray-400 mb-2">
                {p.market.replace("player_", "").replace("_yds", "").toUpperCase()}
              </p>
              <p>
                Line: <span className="font-bold">{p.point}</span>
              </p>
              <p>
                Price: <span className="font-bold">{p.price}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

useEffect(() => {
  const fetchData = async () => {
    try {
      // ✅ Fetch player props from your backend
      const res = await fetch("/api/fetch-nfl-stats", { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setPlayers(json.stats || []);
      } else {
        console.error("Failed to load player data:", json.error);
      }

      // ✅ (optional) if you later have a separate stats route:
      // const statsRes = await fetch("/api/fetch-nfl-recent-stats", { cache: "no-store" });
      // const statsJson = await statsRes.json();
      // if (statsJson.success) setStatsData(statsJson.stats);

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  fetchData();
}, []);

  // Group props by player
  const grouped = propsData.reduce((acc: Record<string, PlayerProp[]>, prop) => {
    const playerName = prop.description || "Unknown";
    if (!acc[playerName]) acc[playerName] = [];
    acc[playerName].push(prop);
    return acc;
  }, {});

  // Filtered + sorted players
  const filteredPlayers = Object.keys(grouped)
    .filter((name) =>
      name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort();

  // Find matching stats (case-insensitive)
  const getStatsForPlayer = (playerName: string | null) => {
    if (!playerName) return undefined;
    const normalizedName = normalizeName(playerName);
    return statsData.find(
      (s) => normalizeName(s.player) === normalizedName
    );
  };

  return (
    <main className="min-h-screen bg-[#0B0D10] text-white p-8">
      <h1 className="text-5xl font-bold text-center text-green-500 mb-6">
        NFL Player Props
      </h1>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-900 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => {
          const props = grouped[player];
          const stats = getStatsForPlayer(player);

          return (
            <div
              key={player}
              className="bg-[#17191E] p-5 rounded-xl shadow-md hover:shadow-green-700/30 transition-shadow"
            >
              <h2 className="text-xl font-bold text-green-400 mb-1">
                {player}
              </h2>
              <p className="text-gray-400 text-sm mb-2">
                {props[0]?.home_team} vs {props[0]?.away_team}
              </p>

              <div className="space-y-3 border-t border-gray-700 pt-3">
                {props.map((prop) => (
                  <div key={`${player}-${prop.market}`}>
                    <p className="text-gray-200 font-medium">
                      {marketLabel(prop.market)} —{" "}
                      <span className="font-bold">
                        {prop.point ?? "-"}
                      </span>
                    </p>

                    {stats ? (
                      <div className="text-gray-400 text-sm mt-1">
                        <p>
  Cover % (L5):{" "}
  <span className="text-green-400">
    {(stats["cover_%_l5"] ?? "-")}%
  </span>
</p>

                        <p>
                          Δ vs Line:{" "}
                          <span
                            className={
                              (stats.delta_avg_to_line ?? 0) > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {stats.delta_avg_to_line ?? "-"}
                          </span>
                        </p>

                        {/* Simple bar visualization for last 5 games */}
                        <div className="flex gap-1 mt-2">
                          {["1", "2", "3", "4", "5"].map((g) => {
                            const val = (stats as any)[g];
                            const line = prop.point || 0;
                            const above = val && line && val > line;
                            return (
                              <div
                                key={g}
                                className={`w-5 h-3 rounded ${
                                  val == null
                                    ? "bg-gray-700"
                                    : above
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                                title={`Game ${g}: ${val ?? "N/A"}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">
                        No recent game stats available.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
