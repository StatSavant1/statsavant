"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UpgradeBanner() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const user = await res.json();

        // Only show when user exists & is inactive
        if (user?.user_id && user.subscription_status !== "active") {
          // Hide on pages where banner shouldn’t appear
          if (pathname !== "/subscribe" && pathname !== "/account") {
            setShow(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [pathname]);

  if (!show) return null;

  return (
    <div className="w-full bg-green-600 text-black py-3 px-4 flex items-center justify-between shadow-md">
      <p className="font-semibold text-sm sm:text-base">
        🚀 Unlock full StatSavant access — <span className="font-bold">only $9.99/month</span> for Founders!
      </p>

      <div className="flex items-center gap-4">

        <Link
          href="/subscribe"
          className="bg-black text-green-400 font-bold px-4 py-2 rounded-xl text-sm hover:bg-neutral-900 transition"
        >
          Upgrade Now
        </Link>

        <button
          onClick={() => setShow(false)}
          className="text-black font-bold hover:text-neutral-800 text-xl leading-none"
        >
          ×
        </button>

      </div>
    </div>
  );
}
