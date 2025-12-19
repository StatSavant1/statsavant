"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 Auth check (single source of truth)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });

        const json = await res.json();
        setUser(json?.user_id ? json : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <header className="w-full bg-black border-b border-neutral-800 h-[56px]" />
    );
  }

  return (
    <header className="w-full bg-black border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="text-green-400 text-xl font-bold">
          StatSavant
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/nfl" className="text-gray-300 hover:text-green-400">
            NFL
          </Link>
          <Link href="/nba" className="text-gray-300 hover:text-green-400">
            NBA
          </Link>
        </nav>

        {/* AUTH */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link href="/login" className="text-gray-300 hover:text-green-400">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-xl font-bold"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/account" className="text-gray-300 hover:text-green-400">
                Account
              </Link>
              <Link
                href="/logout"
                className="text-gray-300 hover:text-red-400"
                onClick={() => setUser(null)}
              >
                Logout
              </Link>
            </>
          )}
        </div>

        {/* MOBILE */}
        <button
          className="md:hidden text-gray-300 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-neutral-900 border-t border-neutral-800 px-4 pb-4 space-y-4">
          <Link href="/nfl" onClick={() => setMenuOpen(false)}>NFL</Link>
          <Link href="/nba" onClick={() => setMenuOpen(false)}>NBA</Link>

          {!user ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)}>Account</Link>
              <Link href="/logout" onClick={() => setMenuOpen(false)}>Logout</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}









