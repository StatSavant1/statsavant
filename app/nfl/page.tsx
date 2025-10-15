"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface PlayerProp {
  description: string | null;
  home_team: string | null;
  away_team: string | null;
  market: string | null;
  label: string | null;
  price: number | null;
  point: number | null;
}

export default function NFLPage() {
  const [data, setData] = useState<PlayerProp[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("nfl_player_props")
          .select("*")
          .order("description", { ascending: true });

        if (error) {
          console.error("Supabase fetch error:", error.message);
          setError("Error loading data from Supabase.");
        } else if (data) {
          setData(data);
        }
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError("Unexpected error loading data.");
      }
    };
    fetchData();
  }, []);

  const grouped = data.reduce((acc: any, item) => {
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
          {filteredPlayers.map((player) => (
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

              {grouped[player].map((prop: PlayerProp, idx: number) => (
                <div
                  key={idx}
                  className="mb-2 border-t border-gray-800 pt-2 last:border-b-0"
                >
                  <p className="text-gray-300 font-medium">
                    {marketLabel(prop.market)} —{" "}
                    <span className="font-bold">{prop.point ?? "-"}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    {prop.label ?? ""} {prop.price ?? ""}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

