"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const supabase = supabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Logging out…
    </div>
  );
}
