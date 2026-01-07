"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/components/AuthProvider";

export default function LoginInner() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { refreshAuth, isSubscriber } = useAuth();
  const searchParams = useSearchParams();

  // Explicit redirect (only used when provided)
  const explicitRedirect = searchParams.get("redirect");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.session) throw new Error("No session returned");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        if (!data.session) {
          throw new Error(
            "Account created. Please check your email to confirm."
          );
        }
      }

      // 🔑 Sync auth + subscription state
      await refreshAuth();

      // ⏭️ Decide redirect AFTER auth state is ready
      setTimeout(() => {
        if (explicitRedirect) {
          // Respect explicit redirect when provided
          window.location.replace(explicitRedirect);
        } else if (isSubscriber) {
          // Active subscriber → home
          window.location.replace("/");
        } else {
          // Free / inactive user → subscribe
          window.location.replace("/subscribe");
        }
      }, 0);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
      >
        <h1 className="text-2xl font-bold text-green-400 mb-2 text-center">
          {mode === "login" ? "Login" : "Create Account"}
        </h1>

        <p className="text-sm text-gray-400 mb-6 text-center">
          {mode === "login"
            ? "Log in to access StatSavant"
            : "Create an account to unlock StatSavant"}
        </p>

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
          {loading
            ? mode === "login"
              ? "Logging in…"
              : "Creating account…"
            : mode === "login"
            ? "Login"
            : "Create Account"}
        </button>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="text-sm text-gray-400 mt-6 text-center">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-green-400 hover:underline font-semibold"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-green-400 hover:underline font-semibold"
              >
                Login
              </button>
            </>
          )}
        </p>
      </form>
    </main>
  );
}

