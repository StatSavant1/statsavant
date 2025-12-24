"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const supabase = supabaseBrowserClient();

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", currentUser.id)
          .single();

        setSubscriptionStatus(profile?.subscription_status ?? null);
      } else {
        setSubscriptionStatus(null);
      }

      setLoading(false);
    };

    loadUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status")
            .eq("id", session.user.id)
            .single();

          setSubscriptionStatus(profile?.subscription_status ?? null);
        } else {
          setSubscriptionStatus(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  if (loading) return null;

  const isActive = (path: string) =>
    pathname === path ? "text-green-400 font-semibold" : "";

  const showSubscribe = subscriptionStatus !== "active";

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-950 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-green-400">
          StatSavant
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-gray-300 items-center">
          <li>
            <Link href="/nfl" className={`hover:text-green-400 transition ${isActive("/nfl")}`}>
              NFL
            </Link>
          </li>
          <li>
            <Link href="/nba" className={`hover:text-green-400 transition ${isActive("/nba")}`}>
              NBA
            </Link>
          </li>

          {/* ✅ Subscribe (hidden if active) */}
          {showSubscribe && (
            <li>
              <Link
                href="/subscribe"
                className={`hover:text-green-400 transition ${isActive("/subscribe")}`}
              >
                Subscribe
              </Link>
            </li>
          )}

          {user ? (
            <>
              <li>
                <Link
                  href="/account"
                  className={`hover:text-green-400 transition font-semibold ${isActive("/account")}`}
                >
                  Account
                </Link>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = "/logout")}
                  className="text-gray-400 hover:text-white transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="hover:text-green-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="bg-green-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-green-400 transition"
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[64px] bg-black border-t border-neutral-800 md:hidden">
          <ul className="flex flex-col px-6 py-6 space-y-4 text-gray-300">
            <li>
              <Link href="/nfl" onClick={() => setMenuOpen(false)}>
                NFL
              </Link>
            </li>
            <li>
              <Link href="/nba" onClick={() => setMenuOpen(false)}>
                NBA
              </Link>
            </li>

            {/* ✅ Subscribe (hidden if active) */}
            {showSubscribe && (
              <li>
                <Link
                  href="/subscribe"
                  onClick={() => setMenuOpen(false)}
                  className="text-green-400 font-semibold"
                >
                  Subscribe
                </Link>
              </li>
            )}

            {user ? (
              <>
                <li>
                  <Link href="/account" onClick={() => setMenuOpen(false)}>
                    Account
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      window.location.href = "/logout";
                    }}
                    className="text-left text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="bg-green-500 text-black font-bold px-4 py-2 rounded-xl text-center"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}




