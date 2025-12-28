"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

type AuthContextType = {
  isSubscriber: boolean;
  authChecked: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isSubscriber: false,
  authChecked: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowserClient();
    let cancelled = false;

    const AUTH_TIMEOUT_MS = 3000;

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("⚠️ Auth timeout — rendering as logged out");
        setIsSubscriber(false);
        setAuthChecked(true);
      }
    }, AUTH_TIMEOUT_MS);

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          await supabase.auth.signOut();
          setIsSubscriber(false);
          return;
        }

        const user = data.session?.user;
        if (!user) {
          setIsSubscriber(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setIsSubscriber(false);
          return;
        }

        setIsSubscriber(profile?.subscription_status === "active");
      } catch {
        try {
          await supabase.auth.signOut();
        } catch {}
        setIsSubscriber(false);
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setAuthChecked(true);
        }
      }
    }

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setIsSubscriber(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", session.user.id)
          .single();

        setIsSubscriber(profile?.subscription_status === "active");
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isSubscriber, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
