"use client";

import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/PlayerCard";

export default function NFLPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/fetch-nfl-stats", { cache: "no-store" });
        const data = await res.json();

        if (data.success && data.stats) {
          setPlayers(data.stats);

          // find latest update timestamp
          const timestamps = data.stats
            .map((p: any) => p.updated_at)
            .filter(Boolean)
            .map((t: string) => new Date(t).getTime());

          if (timestamps.length > 0) {
            const latest = new Date(Math.max(...timestamps)).toISOString();
            setLastUpdated(latest);
          }
        }
      } catch (error) {
        console.error("Error fetching NFL stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-400">NFL Passing Yards Trends</h1>

      {lastUpdated && (
        <p className="text-sm text-gray-400 mb-4">
          🕒 Last updated: {new Date(lastUpdated).toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {players
            .filter((p) => p.line !== null && p.line !== undefined) // 👈 only show active lines
            .map((player, idx) => (
              <PlayerCard key={idx} player={player} />
            ))}
        </div>
      )}
    </main>
  );
}





