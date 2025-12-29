"use client";

import { useEffect } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LogoutPage() {
  useEffect(() => {
    const supabase = supabaseBrowserClient();

    async function logout() {
      try {
        // 🔥 Explicitly revoke session everywhere
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        // Force hard reload so middleware + cookies reset
        window.location.replace("/login");
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



