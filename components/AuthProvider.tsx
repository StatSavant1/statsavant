"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

type AuthContextType = {
  user: any | null;
  isLoggedIn: boolean;
  isSubscriber: boolean;
  authChecked: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isSubscriber: false,
  authChecked: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowserClient();
    let cancelled = false;

    // 🔒 Fail-safe: never block UI forever
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setAuthChecked(true);
      }
    }, 1500);

    async function validateAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session?.user) {
          if (cancelled) return;
          setUser(null);
          setIsSubscriber(false);
          setAuthChecked(true);
          return;
        }

        setUser(session.user);

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", session.user.id)
          .single();

        if (!cancelled) {
          setIsSubscriber(profile?.subscription_status === "active");
          setAuthChecked(true);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
          setIsSubscriber(false);
          setAuthChecked(true);
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    // Initial check
    validateAuth();

    // 🔁 Re-validate on ANY auth event
    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      await validateAuth();
    });

    // 🔥 CRITICAL: re-check when tab regains focus / visibility
    const handleFocus = async () => {
      await validateAuth();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isSubscriber,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}





