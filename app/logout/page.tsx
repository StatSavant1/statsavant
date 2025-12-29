"use client";

import { useEffect } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LogoutPage() {
  useEffect(() => {
    const supabase = supabaseBrowserClient();

    async function logout() {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        // 🔥 FORCE FULL RELOAD (bypasses App Router + cache)
        window.location.href = "/login";
      }
    }

    logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Logging out…
    </div>
  );
}


