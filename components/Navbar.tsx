"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { isSubscriber, authChecked } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!authChecked) return null;

  const isActive = (path: string) =>
    pathname === path ? "text-green-400 font-semibold" : "";

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-950 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-green-400">
          StatSavant
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex space-x-8 text-gray-300 items-center">
          <li>
            <Link href="/nfl" className={`hover:text-green-400 ${isActive("/nfl")}`}>
              NFL
            </Link>
          </li>
          <li>
            <Link href="/nba" className={`hover:text-green-400 ${isActive("/nba")}`}>
              NBA
            </Link>
          </li>

          {!isSubscriber && (
            <li>
              <Link
                href="/subscribe"
                className={`hover:text-green-400 ${isActive("/subscribe")}`}
              >
                Subscribe
              </Link>
            </li>
          )}

          <li>
            <Link href="/account" className={isActive("/account")}>
              Account
            </Link>
          </li>

          <li>
            <Link href="/logout" className="text-gray-400 hover:text-white">
              Logout
            </Link>
          </li>
        </ul>

        {/* Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-neutral-800">
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

            {!isSubscriber && (
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

            <li>
              <Link href="/account" onClick={() => setMenuOpen(false)}>
                Account
              </Link>
            </li>
            <li>
              <Link href="/logout" onClick={() => setMenuOpen(false)}>
                Logout
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}






