"use client";

import Link from "next/link";

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-extrabold text-green-400">
          Unlock Full StatSavant Access
        </h1>
        <p className="text-gray-300 text-lg mt-2">
          Get unlimited player prop data for NFL, NBA, and NHL — updated daily.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">

        {/* FOUNDERS PASS */}
        <div className="bg-neutral-900 border border-green-400 rounded-3xl p-8 shadow-lg relative flex flex-col">
          <span className="absolute top-4 right-4 bg-green-600 text-black text-xs font-bold px-3 py-1 rounded-full">
            LIMITED
          </span>

          <h3 className="text-2xl font-bold text-green-400">Founders Pass</h3>
          <p className="text-gray-400 text-sm mt-1">
            Lifetime price lock. First 100 members only.
          </p>

          <div className="text-5xl font-bold mt-6">$9.99
            <span className="text-xl font-normal">/mo</span>
          </div>

          <ul className="text-gray-300 text-sm mt-6 space-y-2">
            <li>✔ Unlimited player prop data</li>
            <li>✔ NFL, NBA, NHL access</li>
            <li>✔ Daily updated trends</li>
            <li>✔ Premium charts + analytics</li>
            <li>✔ Founding member badge</li>
            <li>✔ Lifetime locked pricing</li>
          </ul>

          <a
            href="/api/checkout?plan=founder"
            className="mt-auto bg-green-500 text-black text-center font-bold py-3 rounded-xl hover:bg-green-400 transition"
          >
            Become a Founder
          </a>
        </div>

        {/* PREMIUM MONTHLY */}
        <div className="bg-neutral-900 rounded-3xl p-8 shadow-lg flex flex-col">
          <h3 className="text-2xl font-bold">Premium Monthly</h3>
          <p className="text-gray-400 text-sm mt-1">
            Full access. Cancel anytime.
          </p>

          <div className="text-5xl font-bold mt-6">$14.99
            <span className="text-xl font-normal">/mo</span>
          </div>

          <ul className="text-gray-300 text-sm mt-6 space-y-2">
            <li>✔ Unlimited player props</li>
            <li>✔ All sports included</li>
            <li>✔ Trend breakdowns</li>
            <li>✔ Line movement tracking</li>
            <li>✔ Full chart access</li>
          </ul>

          <a
            href="/api/checkout?plan=monthly"
            className="mt-auto bg-white text-black text-center font-bold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Start Monthly
          </a>
        </div>

        {/* PREMIUM ANNUAL */}
        <div className="bg-neutral-900 rounded-3xl p-8 shadow-lg flex flex-col">
          <h3 className="text-2xl font-bold">Premium Annual</h3>
          <p className="text-green-400 text-sm mt-1 font-semibold">
            Save 45%
          </p>

          <div className="text-5xl font-bold mt-6">$149.99
            <span className="text-xl font-normal">/yr</span>
          </div>

          <ul className="text-gray-300 text-sm mt-6 space-y-2">
            <li>✔ All monthly features</li>
            <li>✔ Best value plan</li>
            <li>✔ Save 45% yearly</li>
            <li>✔ No price increases</li>
          </ul>

          <a
            href="/api/checkout?plan=yearly"
            className="mt-auto bg-white text-black text-center font-bold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Start Yearly
          </a>
        </div>

      </div>
    </div>
  );
}

