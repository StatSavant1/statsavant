"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
<nav className="fixed top-0 left-0 w-full bg-gray-950 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-green-400">
          Stat Savant
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-gray-300">
          <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
          <li><Link href="/nba" className="hover:text-green-400 transition">NBA</Link></li>
          <li><Link href="/nfl" className="hover:text-green-400 transition">NFL</Link></li>
          <li><Link href="/pricing" className="hover:text-green-400 transition">Pricing</Link></li>
          <li><Link href="/blog" className="hover:text-green-400 transition">Blog</Link></li>
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
          <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
          <li><Link href="/nba" className="hover:text-green-400 transition">NBA</Link></li>
          <li><Link href="/nfl" className="hover:text-green-400 transition">NFL</Link></li>
          <li><Link href="/pricing" className="hover:text-green-400 transition">Pricing</Link></li>
          <li><Link href="/blog" className="hover:text-green-400 transition">Blog</Link></li>
        </ul>
      )}
    </nav>
  );
}
