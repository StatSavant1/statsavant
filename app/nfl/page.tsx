"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

type NFLPlayer = {
  player: string;
  market: string;
  line: number | null;
  last_five: number[];
  avg_l5: number | null;
  updated_at: string | null;
  commence_time: string | null;
};

/* =======================
   Helpers
======================= */

function isTodayOrFuture(commenceTime: string | null): boolean {
  if (!commenceTime) return false;

  const gameTime = new Date(commenceTime);
  const now = new Date();
  const estToday = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  estToday.setHours(0, 0, 0, 0);

  return gameTime >= estToday;
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const FREE_PREVIEW_PLAYERS = 5;
const PREVIEW_STORAGE_KEY = "nfl_free_preview_players";

export default function NFLPage() {
  const [players, setPlayers] = useState<NFLPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [marketFilter, setMarketFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [isSubscriber, setIsSubscriber] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  /* =======================
     Auth + Subscription
  ======================= */
  useEffect(() => {
    const supabase = supabaseBrowserClient();

    async function checkSub() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsSubscriber(false);
        setAuthChecked(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      setIsSubscriber(profile?.subscription_status === "active");
      setAuthChecked(true);
    }

    checkSub();
  }, []);

  /* =======================
     Load NFL Data
  ======================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fetch-nfl-stats");
        if (!res.ok) throw new Error("NFL API failed");

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
     Markets
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
      .filter((p) => p.player && p.market)
      .filter((p) => isTodayOrFuture(p.commence_time))
      .filter((p) => (marketFilter === "all" ? true : p.market === marketFilter))
      .filter((p) =>
        p.player.toLowerCase().includes(search.toLowerCase())
      );
  }, [players, marketFilter, search]);

  /* =======================
     Randomized Order
  ======================= */
  const randomizedPlayers = useMemo(() => {
    return shuffle(filteredPlayers);
  }, [filteredPlayers]);

  /* =======================
     Session-Locked Free Preview
  ======================= */
  const freePreviewPlayerSet = useMemo(() => {
    if (isSubscriber) return new Set<string>();

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
      if (stored) {
        return new Set<string>(JSON.parse(stored));
      }
    }

    const seen = new Set<string>();
    const selected: string[] = [];

    for (const row of randomizedPlayers) {
      if (!seen.has(row.player)) {
        seen.add(row.player);
        selected.push(row.player);
      }
      if (selected.length === FREE_PREVIEW_PLAYERS) break;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        PREVIEW_STORAGE_KEY,
        JSON.stringify(selected)
      );
    }

    return new Set(selected);
  }, [randomizedPlayers, isSubscriber]);

  /* =======================
     Free vs Locked Split
  ======================= */
  const freePlayers = useMemo(() => {
    return isSubscriber
      ? randomizedPlayers
      : randomizedPlayers.filter((p) =>
          freePreviewPlayerSet.has(p.player)
        );
  }, [randomizedPlayers, freePreviewPlayerSet, isSubscriber]);

  const lockedPlayers = useMemo(() => {
    return isSubscriber
      ? []
      : randomizedPlayers.filter(
          (p) => !freePreviewPlayerSet.has(p.player)
        );
  }, [randomizedPlayers, freePreviewPlayerSet, isSubscriber]);

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
    return <div className="p-8 text-gray-400">Loading NFL data…</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">NFL Error: {error}</div>;
  }

  const isPaywalled = !isSubscriber;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-400">
          NFL Player Prop Trends
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
                Subscribe to unlock full NFL access.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/subscribe"
                className="bg-green-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-green-400 transition"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {freePlayers.map((p, idx) => (
          <PlayerCard
            key={`free-${p.player}-${p.market}-${idx}`}
            player={p.player}
            market={p.market}
            line={p.line}
            lastGames={p.last_five}
            avg={p.avg_l5}
            windowLabel="L5"
          />
        ))}
      </div>

      {/* LOCKED PLAYERS */}
      {!isSubscriber && (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6">
          {lockedPlayers.map((p, idx) => (
            <div
              key={`locked-${p.player}-${p.market}-${idx}`}
              className="relative mb-6 break-inside-avoid"
            >
              <div className="blur-md pointer-events-none">
                <PlayerCard
                  player={p.player}
                  market={p.market}
                  line={p.line}
                  lastGames={p.last_five}
                  avg={p.avg_l5}
                  windowLabel="L5"
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






























