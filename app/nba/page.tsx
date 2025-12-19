"use client";

import { useEffect, useMemo, useState } from "react";
import PlayerCard from "@/components/PlayerCard";

type NBAPlayer = {
  player: string | null;
  market: string;
  line: number | null;
  last_ten: number[];
  avg_l10: number | null;
  updated_at: string | null;
};

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

export default function NBAPage() {
  const [players, setPlayers] = useState<NBAPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [marketFilter, setMarketFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsAuthed(!!d?.user_id))
      .catch(() => setIsAuthed(false));
  }, []);

  /* 📥 LOAD NBA DATA */
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

  /* 📊 MARKETS (FILTER OUT ASSISTS) */
const markets = useMemo(() => {
  return Array.from(
    new Set(
      players
        .map((p) => p.market)
        .filter((m) => m !== "player_assists")
    )
  );
}, [players]);

  /* 🎯 FILTER FIRST (TODAY ONLY – EST) */
  const filteredPlayers = useMemo(() => {
    return players
      // 🕒 KEEP TODAY'S PROPS UNTIL 11:59 PM EST
      .filter((p) => isTodayEST(p.updated_at))
      // Market filter
      .filter((p) =>
        marketFilter === "all" ? true : p.market === marketFilter
      )
      // Search filter
      .filter((p) =>
        (p.player ?? "").toLowerCase().includes(search.toLowerCase())
      );
  }, [players, marketFilter, search]);

  /* ⭐ POINTS FIRST + RANDOM OTHERS */
  const orderedPlayers = useMemo(() => {
    const points = filteredPlayers.filter(
      (p) => p.market === "player_points"
    );
    const others = filteredPlayers.filter(
      (p) => p.market !== "player_points"
    );

    // shuffle non-points
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    return [...points, ...others];
  }, [filteredPlayers]);

  /* 🔒 FREE PREVIEW LIMIT */
  const visiblePlayers = useMemo(() => {
    return isAuthed ? orderedPlayers : orderedPlayers.slice(0, 5);
  }, [orderedPlayers, isAuthed]);

  const lastUpdated = useMemo(() => {
    const dates = players
      .map((p) => p.updated_at)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (!dates.length) return null;
    return new Date(Math.max(...dates)).toLocaleString();
  }, [players]);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading NBA data…</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">NBA Error: {error}</div>;
  }

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
      </div>

      {/* PAYWALL BANNER */}
      {!isAuthed && (
        <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">
              You’re viewing a limited free preview.
            </p>
            <p className="text-sm text-gray-400">
              Subscribe to unlock full NBA player prop access.
            </p>
          </div>
          <div className="flex gap-3">
            <a
  href="/pricing"
  className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-bold transition"
>
  Subscribe
</a>
            <a
              href="/login"
              className="border border-neutral-700 px-4 py-2 rounded-lg"
            >
              Login
            </a>
          </div>
        </div>
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

      {/* EMPTY STATE OR PLAYER GRID */}
      {visiblePlayers.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-xl font-semibold text-green-400">
            No NBA props available right now
          </p>
          <p className="mt-2 text-sm">
            Props populate when lines are released.
          </p>
          <p className="text-sm">
            Today’s props are removed once the day ends at 11:59 PM EST.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visiblePlayers.map((p, idx) => (
            <PlayerCard
              key={`${p.player ?? "unknown"}-${p.market}-${idx}`}
              player={p.player ?? "Unknown"}
              market={p.market}
              line={p.line}
              lastGames={p.last_ten}
              avg={p.avg_l10}
              windowLabel="L10"
            />
          ))}
        </div>
      )}
    </div>
  );
}





















































