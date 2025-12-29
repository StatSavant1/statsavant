"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowserClient();

    async function logout() {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        // IMPORTANT: force full auth + middleware refresh
        router.replace("/login");
        router.refresh();
      }
    }

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Logging out…
    </div>
  );
}

