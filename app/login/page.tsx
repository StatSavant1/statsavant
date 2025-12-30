"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { refreshAuth } = useAuth();

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

      if (error) throw error;
      if (!data.session) throw new Error("No session returned");

      // 🔑 CRITICAL: re-hydrate client auth from server cookies
      await refreshAuth();

      // 🔥 Force full navigation so middleware + navbar sync
      window.location.replace("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-3 rounded-lg bg-neutral-800 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
    </main>
  );
}








