"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NFLPage() {
  const [propsData, setPropsData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: props, error: propsErr } = await supabase
          .from("nfl_player_props")
          .select("*");

        const qbStats = await supabase.from("nfl_qb_recent_stats").select("*");
        const rbStats = await supabase.from("nfl_rb_recent_stats").select("*");
        const wrStats = await supabase.from("nfl_wr_recent_stats").select("*");

        if (propsErr || qbStats.error || rbStats.error || wrStats.error) {
          console.error("Supabase fetch error:", propsErr || qbStats.error || rbStats.error || wrStats.error);
          setError("Error loading data from Supabase.");
        } else {
          setPropsData(props || []);
          // merge all player stats
          setStatsData([
            ...(qbStats.data || []),
            ...(rbStats.data || []),
            ...(wrStats.data || []),
          ]);
        }
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError("Unexpected error loading data.");
      }
    };

    fetchData();
  }, []);

  const getStatsForPlayer = (player: string | null) =>
    statsData.find(
      (s) => s.player_name?.trim().toLowerCase() === player?.trim().toLowerCase()
    );

  const grouped = propsData.reduce((acc: any, item: any) => {
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
            const uniqueMarkets = Object.values(
              grouped[player].reduce((acc: any, prop: any) => {
                const key = prop.market || "";
                if (key && !acc[key] && prop.label === "Over") acc[key] = prop;
                return acc;
              }, {} as Record<string, any>)
            );

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

 {uniqueMarkets.map((p: any, idx) => {
  const prop = p as {
    market: string | null;
    point: number | null;
  };
  return (
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
            Avg L5: {stats.avg_l_5 ?? "-"}
          </p>
          <p className="text-sm text-gray-400 mb-1">
            Cover %:{" "}
            <span
              className={
                (stats.cover_%_l5 ?? 0) > 50
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {stats.cover_%_l5 ?? 0}%
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

          {/* Last 5 Games */}
          <div className="flex gap-1 text-xs mt-2">
            {[stats["1"], stats["2"], stats["3"], stats["4"], stats["5"]].map(
              (val: number | null, i: number) => (
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
              )
            )}
          </div>
        </>
      )}
    </div>
  );
})}



