"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

type PlayerProp = {
  player: string;
  market: string;
  label: string;
  point: number | null;
  price: number | null;
  home_team?: string | null;
  away_team?: string | null;
  bookmaker?: string | null;
  updated_at?: string | null;
};

type PlayerStats = {
  player: string;
  g1: number | null;
  g2: number | null;
  g3: number | null;
  g4: number | null;
  g5: number | null;
  ["cover_%_l5"]: number | null; // ✅ fixed key
  avg_l_5: number | null;
  delta_avg_to_line: number | null;
};

function marketLabel(key: string) {
  switch (key) {
    case "player_pass_yds":
      return "Passing Yards";
    case "player_rush_yds":
      return "Rushing Yards";
    case "player_reception_yds":
      return "Receiving Yards";
    default:
      return key.replace(/^player_/, "").replace(/_/g, " ").toUpperCase();
  }
}

export default function NFLPage() {
  const [players, setPlayers] = useState<PlayerProp[]>([]);
  const [recentStats, setRecentStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/fetch-nfl-stats", { cache: "no-store" });
        const json = await res.json();

        if (json?.success) {
          setPlayers(Array.isArray(json.stats) ? json.stats : []);
          setRecentStats(Array.isArray(json.recentStats) ? json.recentStats : []);
        } else {
          setErr(json?.error || "Failed to load player data.");
        }
      } catch (e: any) {
        setErr(e?.message || "Network error.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = players
    .filter((p) =>
      q.trim()
        ? p.player?.toLowerCase().includes(q.trim().toLowerCase())
        : true
    )
    .filter((p) => (marketFilter === "all" ? true : p.market === marketFilter));

  const getPlayerStats = (name: string) =>
    recentStats.find(
      (s) => s.player?.toLowerCase().trim() === name?.toLowerCase().trim()
    );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          NFL Player Props
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player..."
            className="w-full md:w-1/2 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 outline-none"
          />
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="w-full md:w-56 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 outline-none"
          >
            <option value="all">All Markets</option>
            <option value="player_pass_yds">Passing Yards</option>
            <option value="player_rush_yds">Rushing Yards</option>
            <option value="player_reception_yds">Receiving Yards</option>
          </select>
        </div>

        {loading && <p className="text-gray-400">Loading player data...</p>}
        {err && !loading && <p className="text-red-400">Error: {err}</p>}
        {!loading && !err && filtered.length === 0 && (
          <p className="text-gray-400">No matching players found.</p>
        )}

        {!loading && !err && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, idx) => {
              const stat = getPlayerStats(p.player);
              const chartData =
                stat && stat.g1 != null
                  ? [
                      { game: "1", yds: stat.g1 },
                      { game: "2", yds: stat.g2 },
                      { game: "3", yds: stat.g3 },
                      { game: "4", yds: stat.g4 },
                      { game: "5", yds: stat.g5 },
                    ]
                  : [];

              return (
                <div
                  key={`${p.player}-${idx}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">{p.player}</h2>
                    <span className="text-xs text-zinc-400">
                      {p.bookmaker || ""}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 mb-1">
                    {marketLabel(p.market)} —{" "}
                    <span className="text-zinc-200 font-medium">{p.label}</span>
                  </p>

                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-sm text-zinc-400">Line</p>
                      <p className="text-xl font-bold">{p.point ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Price</p>
                      <p className="text-xl font-bold">{p.price ?? "—"}</p>
                    </div>
                  </div>

                  {/* 🔥 Bar Chart with color-coded bars */}
                  {stat && chartData.length > 0 && (
                    <div className="h-32 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="game" stroke="#666" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#111",
                              border: "1px solid #333",
                            }}
                          />
                          <Bar dataKey="yds" radius={[4, 4, 0, 0]}>
                            {chartData.map((d, i) => {
                              const overLine =
                                p.point && d.yds != null
                                  ? d.yds >= p.point
                                  : false;
                              return (
                                <Cell
                                  key={`cell-${i}`}
                                  fill={overLine ? "#22c55e" : "#ef4444"}
                                />
                              );
                            })}
                          </Bar>

                          {/* Red dashed = Current Line */}
                          {p.point && (
                            <ReferenceLine
                              y={p.point}
                              stroke="#ef4444"
                              strokeDasharray="3 3"
                              label={{
                                position: "right",
                                value: "Line",
                                fill: "#ef4444",
                                fontSize: 10,
                              }}
                            />
                          )}

                          {/* Blue solid = Avg (L5) */}
                          {stat.avg_l_5 && (
                            <ReferenceLine
                              y={stat.avg_l_5}
                              stroke="#3b82f6"
                              label={{
                                position: "right",
                                value: "Avg",
                                fill: "#3b82f6",
                                fontSize: 10,
                              }}
                            />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Stats Summary */}
                  {stat && (
                    <>
                      <p className="text-sm">
                        Avg (L5):{" "}
                        <span className="font-semibold text-green-400">
                          {stat.avg_l_5 ?? "—"}
                        </span>
                      </p>
                      <p className="text-sm">
                        Cover % (L5):{" "}
                        <span className="font-semibold text-yellow-400">
                          {stat["cover_%_l5"] ?? "—"}%
                        </span>
                      </p>
                      <p className="text-sm">
                        Δ Avg→Line:{" "}
                        <span className="font-semibold text-blue-400">
                          {stat.delta_avg_to_line ?? "—"}
                        </span>
                      </p>
                    </>
                  )}

                  {(p.home_team || p.away_team) && (
                    <p className="mt-3 text-xs text-zinc-500">
                      {p.away_team ?? "TBD"} @ {p.home_team ?? "TBD"}
                    </p>
                  )}

                  {p.updated_at && (
                    <p className="mt-2 text-[11px] text-zinc-600">
                      Updated: {new Date(p.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


