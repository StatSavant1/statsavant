"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type PlayerStats = {
  player: string;
  g1: number | null;
  g2: number | null;
  g3: number | null;
  g4: number | null;
  g5: number | null;
  avg_l_5: number | null;
  cover_pct_l5: number | null;
  current_line: number | null;
};

export default function NFLPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/fetch-nfl-stats", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setPlayers(
            data.stats.filter((p: PlayerStats) => p.player && p.g1 !== null)
          );
        }
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };
    fetchData();
  }, []);

  const filtered = players.filter((p) =>
    p.player.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-green-400">
        NFL Player Trends vs Current Line
      </h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96 px-4 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((player, idx) => (
          <div
            key={idx}
            className="p-4 bg-zinc-900 rounded-xl shadow-md hover:shadow-green-500/20 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-400">
              {player.player}
            </h2>

            <p className="text-sm text-zinc-400 mb-1">
              Current Line:{" "}
              <span className="text-red-400">
                {player.current_line ?? "-"}
              </span>
            </p>
            <p className="text-sm text-zinc-400 mb-1">
              Avg (L5):{" "}
              <span className="text-blue-300">{player.avg_l_5 ?? "-"}</span>
            </p>
            <p className="text-sm text-zinc-400 mb-3">
              Cover % (L5):{" "}
              <span className="text-green-300">
                {player.cover_pct_l5 ?? "-"}%
              </span>
            </p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { game: "G1", value: player.g1 },
                    { game: "G2", value: player.g2 },
                    { game: "G3", value: player.g3 },
                    { game: "G4", value: player.g4 },
                    { game: "G5", value: player.g5 },
                  ]}
                >
                  <XAxis dataKey="game" stroke="#ccc" />
                  <YAxis stroke="#ccc" hide />
                  <Tooltip />
                  {/* ✅ Line for current prop */}
                  {player.current_line && (
                    <ReferenceLine
                      y={player.current_line}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label={{
                        value: `Line: ${player.current_line}`,
                        fill: "#ef4444",
                        position: "top",
                      }}
                    />
                  )}
                  <Bar dataKey="value" fill="#22c55e">
                    <LabelList dataKey="value" position="top" fill="#fff" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}



