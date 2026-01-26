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
            See Which Player Props Are Trending — Before You Bet
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-4">
            Instantly compare last 10 or last 5 games vs today&apos;s lines for
            NFL, NBA, and NHL player props.
          </p>

          {/* NEW: Free-first message (above the fold) */}
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto mb-8">
            <span className="text-white font-semibold">Start free:</span> create
            an account to explore trends. Upgrade anytime for full access.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* NEW: Primary CTA = Start Free */}
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl transition"
            >
              Start Free (Create Account)
            </Link>

            <Link
              href="/nfl"
              className="bg-neutral-900 border border-neutral-700 hover:border-green-500 text-white font-bold px-8 py-4 rounded-xl transition"
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

          {/* NEW: Tiny reassurance under buttons */}
          <p className="text-gray-500 text-xs mt-4">
            Free account required to explore. No picks. No hype. Just data.
          </p>
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
              players are clearing today&apos;s lines.
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
            Start Free — Upgrade When You&apos;re Ready
          </h2>

          <p className="text-gray-300 max-w-3xl mx-auto mb-6">
            Create a free account to explore trends. When you&apos;re ready,
            upgrade to unlock full access to all player props, markets, and
            trend data across every supported sport.
          </p>

          <p className="text-gray-400 text-sm mb-8">
            No picks. No bias. Just clean data designed to help you make better
            betting decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* NEW: Start Free CTA in value section too */}
            <Link
              href="/signup"
              className="inline-block bg-green-500 hover:bg-green-600 text-black font-bold px-10 py-4 rounded-xl transition"
            >
              Create Free Account
            </Link>

            <Link
              href="/subscribe"
              className="inline-block bg-neutral-900 border border-neutral-700 hover:border-green-500 text-white font-bold px-10 py-4 rounded-xl transition"
            >
              View Plans
            </Link>
          </div>

          {/* NEW: micro-copy to reduce friction */}
          <p className="text-gray-500 text-xs mt-4">
            Most users start free to explore before upgrading.
          </p>
        </section>
      </div>
    </main>
  );
}


