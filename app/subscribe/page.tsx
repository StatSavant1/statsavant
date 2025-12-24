"use client";

import { useState } from "react";

export default function SubscribePage() {
  const [loadingPlan, setLoadingPlan] = useState<
    "founder" | "monthly" | "yearly" | null
  >(null);

  async function startCheckout(
    plan: "founder" | "monthly" | "yearly"
  ) {
    try {
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.error || "Unable to start checkout");
        setLoadingPlan(null);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-green-400">
            Unlock Full StatSavant Access
          </h1>
          <p className="mt-4 text-gray-400">
            Get unlimited player prop data for NFL, NBA, and NHL — updated daily.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Founder */}
          <div className="border-2 border-green-500 rounded-xl p-8 bg-zinc-900 relative">
            <span className="absolute top-4 right-4 text-xs bg-green-500 text-black px-3 py-1 rounded-full">
              LIMITED
            </span>

            <h2 className="text-2xl font-bold mb-2 text-green-400">
              Founders Pass
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Lifetime price lock. First 100 members only.
            </p>

            <div className="text-4xl font-bold mb-6">
              $9.99 <span className="text-base font-normal text-gray-400">/mo</span>
            </div>

            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              <li>✔ Unlimited player prop data</li>
              <li>✔ NFL, NBA, NHL access</li>
              <li>✔ Daily updated trends</li>
              <li>✔ Premium charts + analytics</li>
              <li>✔ Lifetime locked pricing</li>
            </ul>

            <button
              onClick={() => startCheckout("founder")}
              disabled={loadingPlan !== null}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loadingPlan === "founder" ? "Redirecting..." : "Become a Founder"}
            </button>
          </div>

          {/* Monthly */}
          <div className="rounded-xl p-8 bg-zinc-900 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-2">Premium Monthly</h2>
            <p className="text-sm text-gray-400 mb-6">
              Full access. Cancel anytime.
            </p>

            <div className="text-4xl font-bold mb-6">
              $14.99 <span className="text-base font-normal text-gray-400">/mo</span>
            </div>

            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              <li>✔ Unlimited player props</li>
              <li>✔ All sports included</li>
              <li>✔ Trend breakdowns</li>
              <li>✔ Line movement tracking</li>
              <li>✔ Full chart access</li>
            </ul>

            <button
              onClick={() => startCheckout("monthly")}
              disabled={loadingPlan !== null}
              className="w-full bg-gray-200 hover:bg-white text-black font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loadingPlan === "monthly" ? "Redirecting..." : "Start Monthly"}
            </button>
          </div>

          {/* Yearly */}
          <div className="rounded-xl p-8 bg-zinc-900 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-2">Premium Annual</h2>
            <p className="text-sm text-green-400 mb-6">Save 45%</p>

            <div className="text-4xl font-bold mb-6">
              $149.99{" "}
              <span className="text-base font-normal text-gray-400">/yr</span>
            </div>

            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              <li>✔ All monthly features</li>
              <li>✔ Best value plan</li>
              <li>✔ Save 45% yearly</li>
              <li>✔ No price increases</li>
            </ul>

            <button
              onClick={() => startCheckout("yearly")}
              disabled={loadingPlan !== null}
              className="w-full bg-gray-200 hover:bg-white text-black font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loadingPlan === "yearly" ? "Redirecting..." : "Start Yearly"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



