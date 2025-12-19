"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const supabase = supabaseBrowserClient();

  useEffect(() => {
    // Always re-check auth on route change
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  if (loading) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-950 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-green-400">
          StatSavant
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-gray-300 items-center">
          <li><Link href="/nfl" className="hover:text-green-400 transition">NFL</Link></li>
          <li><Link href="/nba" className="hover:text-green-400 transition">NBA</Link></li>
          <li><Link href="/nhl" className="hover:text-green-400 transition">NHL</Link></li>
          <li><Link href="/pricing" className="hover:text-green-400 transition">Pricing</Link></li>

          {user ? (
            <>
              <li>
                <Link
                  href="/account"
                  className="hover:text-green-400 transition font-semibold"
                >
                  Account
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    // single source of truth for logout
                    window.location.href = "/logout";
                  }}
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
          className="md:hidden text-gray-300 focus:outline-none"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <ul className="md:hidden flex flex-col items-center space-y-4 pb-4 text-gray-300 border-t border-gray-800">
          <li><Link href="/nfl" onClick={() => setMenuOpen(false)}>NFL</Link></li>
          <li><Link href="/nba" onClick={() => setMenuOpen(false)}>NBA</Link></li>
          <li><Link href="/nhl" onClick={() => setMenuOpen(false)}>NHL</Link></li>
          <li><Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link></li>

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
                    window.location.href = "/logout";
                  }}
                  className="text-gray-400 hover:text-white"
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
                  className="bg-green-500 text-black font-bold px-6 py-2 rounded-xl"
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}


