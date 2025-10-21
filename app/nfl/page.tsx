"use client";

import React, { useEffect, useState } from "react";

type PlayerProp = {
  player: string;
  market: string;      // e.g. "player_pass_yds"
  label: string;       // "Over" | "Under"
  point: number | null;
  price: number | null;
  home_team?: string | null;
  away_team?: string | null;
  bookmaker?: string | null;
  updated_at?: string | null;
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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("/api/fetch-nfl-stats", { cache: "no-store" });
        const json = await res.json();

        if (json?.success) {
          setPlayers(Array.isArray(json.stats) ? json.stats : []);
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

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          NFL Player Props
        </h1>

        {/* Controls */}
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

        {/* States */}
        {loading && (
          <p className="text-gray-400">Loading player data...</p>
        )}
        {err && !loading && (
          <p className="text-red-400">Error: {err}</p>
        )}
        {!loading && !err && filtered.length === 0 && (
          <p className="text-gray-400">No matching players found.</p>
        )}

        {/* Grid */}
        {!loading && !err && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, idx) => {
              const key = `${p.player}-${p.market}-${p.label}-${idx}`;
              return (
                <div
                  key={key}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">{p.player}</h2>
                    <span className="text-xs text-zinc-400">
                      {p.bookmaker || ""}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 mb-1">
                    {marketLabel(p.market)} — <span className="text-zinc-200 font-medium">{p.label}</span>
                  </p>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Line</p>
                      <p className="text-xl font-bold">
                        {p.point ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Price</p>
                      <p className="text-xl font-bold">
                        {p.price ?? "—"}
                      </p>
                    </div>
                  </div>

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

