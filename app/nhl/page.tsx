"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";
import { useAuth } from "@/components/AuthProvider";

/* =======================
   Types (MATCH MV SHAPE)
======================= */
type NHLPlayer = {
  player: string;
  market: string;
  line: number | null;
  last_ten: number[];
  avg_l10: number | null;
  updated_at: string | null;
  home_team: string;
  away_team: string;
  commence_time: string;
};

const FREE_PREVIEW_PLAYERS = 5;

/* =======================
   EST Helpers
======================= */
function isTodayOrFutureEST(dateString: string) {
  const gameTime = new Date(dateString);
  const nowEST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  return gameTime >= nowEST;
}

function getTodayESTKey() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
}

/* =======================
   Seeded Shuffle
======================= */
function seededShuffle<T>(arr: T[], seed: string) {
  const copy = [...arr];
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.abs(hash + i) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export default function NHLPage() {
  const { isSubscriber, authChecked } = useAuth();

  const [players, setPlayers] = useState<NHLPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [marketFilter, setMarketFilter] = useState("all");
  const [search, setSearch] = useState("");

  /* =======================
     Load NHL Data
  ======================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fetch-nhl-stats");
        if (!res.ok) throw new Error("NHL API failed");

        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        setPlayers(json.stats || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =======================
     Markets
  ======================= */
  const markets = useMemo(() => {
    return Array.from(new Set(players.map((p) => p.market)));
  }, [players]);

  /* =======================
     Filtering
  ======================= */
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => isTodayOrFutureEST(p.commence_time))
      .filter((p) =>
        marketFilter === "all" ? true : p.market === marketFilter
      )
      .filter((p) =>
        p.player.toLowerCase().includes(search.toLowerCase())
      );
  }, [players, marketFilter, search]);

  /* =======================
     Unique Players
  ======================= */
  const uniquePlayers = useMemo(() => {
    const seen = new Set<string>();
    return filteredPlayers.filter((p) => {
      if (seen.has(p.player)) return false;
      seen.add(p.player);
      return true;
    });
  }, [filteredPlayers]);

  /* =======================
     Free Preview Logic
  ======================= */
  const freePlayers = useMemo(() => {
    if (isSubscriber) return filteredPlayers;

    return seededShuffle(
      uniquePlayers,
      getTodayESTKey()
    ).slice(0, FREE_PREVIEW_PLAYERS);
  }, [uniquePlayers, isSubscriber]);

  const lockedPlayers = useMemo(() => {
    if (isSubscriber) return [];

    const freeSet = new Set(freePlayers.map((p) => p.player));
    return filteredPlayers.filter((p) => !freeSet.has(p.player));
  }, [filteredPlayers, freePlayers, isSubscriber]);

  /* =======================
     Last Updated
  ======================= */
  const lastUpdated = useMemo(() => {
    const times = players
      .map((p) => p.updated_at)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (!times.length) return null;

    return new Date(Math.max(...times)).toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
  }, [players]);

  /* =======================
     Loading / Error
  ======================= */
  if (loading || !authChecked) {
    return <div className="p-8 text-gray-400">Loading NHL data…</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">NHL Error: {error}</div>;
  }

  const isPaywalled = !isSubscriber;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <h1 className="text-3xl font-bold text-green-400 mb-1">
        NHL Player Prop Trends
      </h1>

      {lastUpdated && (
        <p className="text-sm text-gray-400 mb-4">
          Last Updated: {lastUpdated}
        </p>
      )}

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
        >
          <option value="all">All Markets</option>
          {markets.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search player…"
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FREE PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {freePlayers.map((p, idx) => (
          <PlayerCard
            key={`free-${p.player}-${idx}`}
            player={p.player}
            market={p.market}
            line={p.line}
            lastGames={p.last_ten}
            avg={p.avg_l10}
            windowLabel="L10"
          />
        ))}
      </div>

      {/* LOCKED */}
      {!isSubscriber && lockedPlayers.length > 0 && (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6">
          {lockedPlayers.map((p, idx) => (
            <div key={`locked-${p.player}-${idx}`} className="relative mb-6">
              <div className="blur-md pointer-events-none">
                <PlayerCard
                  player={p.player}
                  market={p.market}
                  line={p.line}
                  lastGames={p.last_ten}
                  avg={p.avg_l10}
                  windowLabel="L10"
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/80 border border-neutral-700 rounded-xl p-4 text-center">
                  <p className="font-bold">Subscribe to unlock</p>
                  <Link
                    href="/subscribe"
                    className="inline-block mt-2 bg-green-500 text-black font-bold px-4 py-2 rounded-xl"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




