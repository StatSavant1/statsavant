"use client";

import { useEffect, useState } from "react";

type AccountUser = {
  email: string | null;
  plan_type: string | null;
  subscription_status: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = await res.json();
        setUser(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading account…</div>;
  }

  if (!user) {
    return <div className="p-8 text-red-500">Not logged in.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-400">Account</h1>

        {/* ACCOUNT DETAILS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
          <p>
            <span className="text-gray-400">Email:</span>{" "}
            <span className="text-white">{user.email}</span>
          </p>

          <p>
            <span className="text-gray-400">Plan:</span>{" "}
            <span className="text-white">
              {user.plan_type ?? "Free"}
            </span>
          </p>

          <p>
            <span className="text-gray-400">Status:</span>{" "}
            <span className="text-white">
              {user.subscription_status ?? "inactive"}
            </span>
          </p>
        </div>

        {/* BILLING */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Billing</h2>
            <p className="text-sm text-gray-400">
              Manage your subscription and payment method
            </p>
          </div>

          <a
            href="/api/billing"
            className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition"
          >
            Manage Billing
          </a>
        </div>
      </div>
    </div>
  );
}


