"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, isSubscriber, authChecked } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path ? "text-green-400 font-semibold" : "";

  // ✅ Render a shell immediately so layout never disappears
  if (!authChecked) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-gray-950 z-50 h-16" />
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-950 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-400">
          StatSavant
        </Link>

        {/* ======================
            Desktop Navigation
        ====================== */}
        <ul className="hidden md:flex space-x-8 text-gray-300 items-center">
          <li>
            <Link
              href="/nfl"
              prefetch={false}
              className={`hover:text-green-400 ${isActive("/nfl")}`}
            >
              NFL
            </Link>
          </li>

          <li>
            <Link
              href="/nba"
              prefetch={false}
              className={`hover:text-green-400 ${isActive("/nba")}`}
            >
              NBA
            </Link>
          </li>

          {/* Add NHL Link */}
          <li>
            <Link
              href="/nhl"
              prefetch={false}
              className={`hover:text-green-400 ${isActive("/nhl")}`}
            >
              NHL
            </Link>
          </li>

          {isLoggedIn && !isSubscriber && (
            <li>
              <Link
                href="/subscribe"
                prefetch={false}
                className={`hover:text-green-400 ${isActive("/subscribe")}`}
              >
                Subscribe
              </Link>
            </li>
          )}

          {!isLoggedIn && (
            <li>
              <Link
                href="/login"
                prefetch={false}
                className={`hover:text-green-400 ${isActive("/login")}`}
              >
                Login
              </Link>
            </li>
          )}

          {isLoggedIn && (
            <>
              <li>
                <Link
                  href="/account"
                  prefetch={false}
                  className={`hover:text-green-400 ${isActive("/account")}`}
                >
                  Account
                </Link>
              </li>

              <li>
                <Link
                  href="/logout"
                  prefetch={false}
                  className="text-gray-400 hover:text-white"
                >
                  Logout
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* ======================
            Mobile Toggle
        ====================== */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ======================
          Mobile Navigation
      ====================== */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-neutral-800">
          <ul className="flex flex-col px-6 py-6 space-y-4 text-gray-300">
            <li>
              <Link
                href="/nfl"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
              >
                NFL
              </Link>
            </li>

            <li>
              <Link
                href="/nba"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
              >
                NBA
              </Link>
            </li>

            {/* Add NHL Link to Mobile Menu */}
            <li>
              <Link
                href="/nhl"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
              >
                NHL
              </Link>
            </li>

            {isLoggedIn && !isSubscriber && (
              <li>
                <Link
                  href="/subscribe"
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className="text-green-400 font-semibold"
                >
                  Subscribe
                </Link>
              </li>
            )}

            {!isLoggedIn && (
              <li>
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}

            {isLoggedIn && (
              <>
                <li>
                  <Link
                    href="/account"
                    prefetch={false}
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                </li>

                <li>
                  <Link
                    href="/logout"
                    prefetch={false}
                    onClick={() => setMenuOpen(false)}
                  >
                    Logout
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










