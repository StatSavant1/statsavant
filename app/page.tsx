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
            Smarter Player Prop Research
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8">
            StatSavant helps identify player prop trends across
            NFL and NBA — comparing recent performance against current lines so
            you can make faster, sharper decisions.
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
          </div>
        </section>

        {/* =======================
            HOW IT WORKS
        ======================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              Track Recent Trends
            </h3>
            <p className="text-gray-400 text-sm">
              See how players have performed over their last games with clear,
              visual breakdowns.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              Compare to the Line
            </h3>
            <p className="text-gray-400 text-sm">
              Instantly compare recent averages against today’s prop lines to
              spot potential edges.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              Bet With Confidence
            </h3>
            <p className="text-gray-400 text-sm">
              No picks. No hype. Just clean data to support smarter betting
              decisions.
            </p>
          </div>
        </section>

        {/* =======================
            FREE PREVIEW CTA
        ======================= */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Try StatSavant Free
          </h2>

          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            View a limited free preview of today’s player props. Unlock full
            access to all markets and players with a subscription.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl transition"
            >
              View Pricing
            </Link>

            <Link
              href="/signup"
              className="bg-neutral-800 border border-neutral-700 hover:border-green-500 px-8 py-3 rounded-xl transition"
            >
              Create Free Account
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
