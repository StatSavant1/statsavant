"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    console.log("LOGIN: submitting");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("LOGIN: result", data, error);

      if (error) throw error;
      if (!data.session) throw new Error("No session");

      // 🔑 Force cookie sync by hitting a server route
      await fetch("/api/auth/sync", { method: "POST" });

      window.location.replace("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* your existing UI */}
      <button type="submit">
        {loading ? "Logging in…" : "Login"}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}






