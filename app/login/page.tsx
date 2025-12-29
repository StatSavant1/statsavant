"use client";

import { useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = supabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("No session returned");
      }

      // 🔥 DO NOT WAIT — hard redirect immediately
      window.location.href = "/";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Login
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full mb-4 px-4 py-3 rounded-lg bg-neutral-800 text-white"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full mb-6 px-4 py-3 rounded-lg bg-neutral-800 text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}
      </form>
    </div>
  );
}


