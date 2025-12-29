"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";
import { useAuth } from "@/components/AuthProvider";

type NBAPlayer = {
  player: string | null;
  market: string;
  line: number | null;
  last_ten: number[];
  avg_l10: number | null;
  updated_at: string | null;
};

const FREE_PREVIEW_PLAYERS = 5;

/* =======================
   EST Date Helper
======================= */
function isTodayEST(dateString: string | null) {
  if (!dateString) return false;

  const nowEST = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })
  );

  const startOfTodayEST = new Date(nowEST);
  startOfTodayEST.setHours(0, 0, 0, 0);

  const endOfTodayEST = new Date(nowEST);
  endOfTodayEST.setHours(23, 59, 59, 999);

  const d = new Date(dateString);
  return d >= startOfTodayEST && d <= endOfTodayEST;
}

/* =======================
   Utils
======================= */
function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function NBAPage() {
  /* =======================
     AUTH (GLOBAL PROVIDER)
  ======================= */
  const { isSubscriber, authChecked } = useAuth();

  const [players, setPlayers] = useState<NBAPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [marketFilter, setMarketFilter] = useState("all");
  const [search, setSearch] = useState("");

  /* =======================
     Load NBA Data
  ======================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fetch-nba-stats");
        if (!res.ok) throw new Error("NBA API failed");

        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        setPlayers(json.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =======================
     Markets (allow all)
  ======================= */
  const markets = useMemo(() => {
  return Array.from(
    new Set(players.map((p) => p.market).filter(Boolean))
  );
}, [players]);

  /* =======================
     Base Filtering
  ======================= */
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => isTodayEST(p.updated_at))
      .filter((p) =>
        marketFilter === "all" ? true : p.market === marketFilter
      )
      .filter((p) =>
        (p.player ?? "").toLowerCase().includes(search.toLowerCase())
      );
  }, [players, marketFilter, search]);

  /* =======================
     Points First + Shuffle Others
  ======================= */
  const orderedPlayers = useMemo(() => {
    const points = filteredPlayers.filter(
      (p) => p.market === "player_points"
    );
    const others = filteredPlayers.filter(
      (p) => p.market !== "player_points"
    );
    return [...points, ...shuffle(others)];
  }, [filteredPlayers]);

  /* =======================
     UNIQUE PLAYERS (for preview selection)
  ======================= */
  const uniquePlayers = useMemo(() => {
    const seen = new Set<string>();
    return orderedPlayers.filter((p) => {
      if (!p.player) return false;
      if (seen.has(p.player)) return false;
      seen.add(p.player);
      return true;
    });
  }, [orderedPlayers]);

  /* =======================
     Free vs Locked (HARD CAP = 5 CARDS)
  ======================= */
  const freePlayers = useMemo(() => {
    if (isSubscriber) return orderedPlayers;

    return orderedPlayers
      .filter((p) =>
        uniquePlayers
          .slice(0, FREE_PREVIEW_PLAYERS)
          .some((u) => u.player === p.player)
      )
      .slice(0, FREE_PREVIEW_PLAYERS);
  }, [orderedPlayers, uniquePlayers, isSubscriber]);

  const lockedPlayers = useMemo(() => {
    if (isSubscriber) return [];

    const freeSet = new Set(
      freePlayers.map((p) => `${p.player}-${p.market}`)
    );

    return orderedPlayers.filter(
      (p) => !freeSet.has(`${p.player}-${p.market}`)
    );
  }, [orderedPlayers, freePlayers, isSubscriber]);

  /* =======================
     Last Updated
  ======================= */
  const lastUpdated = useMemo(() => {
    const dates = players
      .map((p) => p.updated_at)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (!dates.length) return null;
    return new Date(Math.max(...dates)).toLocaleString();
  }, [players]);

  /* =======================
     Loading / Error
  ======================= */
  if (loading || !authChecked) {
    return <div className="p-8 text-gray-400">Loading NBA data…</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">NBA Error: {error}</div>;
  }

  const isPaywalled = !isSubscriber;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-400">
          NBA Player Prop Trends
        </h1>

        {lastUpdated && (
          <p className="text-sm text-gray-400 mt-1">
            Last Updated: {lastUpdated}
          </p>
        )}

        {isPaywalled && (
          <div className="mt-4 bg-neutral-900 border border-neutral-700 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-semibold">You’re viewing the free preview.</p>
              <p className="text-gray-400 text-sm">
                Subscribe to unlock full NBA access.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/subscribe"
                className="bg-green-500 text-black font-bold px-4 py-2 rounded-xl"
              >
                Subscribe
              </Link>
              <Link
                href="/login"
                className="bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-xl"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
        >
          <option value="all">All Markets</option>
          {markets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
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

      {/* FREE PREVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {freePlayers.map((p, idx) => (
          <PlayerCard
            key={`free-${p.player ?? "unknown"}-${p.market}-${idx}`}
            player={p.player ?? "Unknown"}
            market={p.market}
            line={p.line}
            lastGames={p.last_ten}
            avg={p.avg_l10}
            windowLabel="L10"
          />
        ))}
      </div>

      {/* LOCKED PLAYERS */}
      {!isSubscriber && lockedPlayers.length > 0 && (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6">
          {lockedPlayers.map((p, idx) => (
            <div
              key={`locked-${p.player ?? "unknown"}-${p.market}-${idx}`}
              className="relative mb-6 break-inside-avoid"
            >
              <div className="blur-md pointer-events-none">
                <PlayerCard
                  player={p.player ?? "Unknown"}
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
























































