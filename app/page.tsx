"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* =======================
            HERO
        ======================= */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-400 mb-6">
            See Which Player Props Are Trending - Before You Bet 
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8">
            Instantly compare last 10 or last 5 vs today's lines for NFL, NBA, and NHL player props.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/nfl"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl transition"
            >
              View NFL Props
            </Link>

            <Link
              href="/nba"
              className="bg-neutral-900 border border-neutral-700 hover:border-green-500 text-white font-bold px-8 py-4 rounded-xl transition"
            >
              View NBA Props
            </Link>

            <Link
              href="/nhl"
              className="bg-neutral-900 border border-neutral-700 hover:border-green-500 text-white font-bold px-8 py-4 rounded-xl transition"
            >
              View NHL Props
            </Link>
          </div>
        </section>

        {/* =======================
            WHY STATSAVANT
        ======================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              Built for Serious Bettors
            </h3>
            <p className="text-gray-400 text-sm">
              Designed for bettors who want data-backed insights — not picks,
              hype, or social media noise.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              Trend-Based Edge
            </h3>
            <p className="text-gray-400 text-sm">
              Instantly see last-10 game performance, averages, and how often
              players are clearing today’s lines.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              One Platform, All Sports
            </h3>
            <p className="text-gray-400 text-sm">
              NFL, NBA, and NHL player props in one clean dashboard — no
              spreadsheets, no tab overload.
            </p>
          </div>
        </section>

        {/* =======================
            SUBSCRIBER VALUE
        ======================= */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-400 mb-4">
            Turn Research Into an Advantage
          </h2>

          <p className="text-gray-300 max-w-3xl mx-auto mb-6">
            StatSavant subscribers unlock full access to all player props,
            markets, and trend data across every supported sport. Whether
            you’re building single bets or parlays, StatSavant helps you
            research smarter and move faster.
          </p>

          <p className="text-gray-400 text-sm mb-8">
            No picks. No bias. Just clean data designed to help you make better
            betting decisions.
          </p>

          <Link
            href="/subscribe"
            className="inline-block bg-green-500 hover:bg-green-600 text-black font-bold px-10 py-4 rounded-xl transition"
          >
            Unlock Full Access
          </Link>
        </section>

      </div>
    </main>
  );
}

