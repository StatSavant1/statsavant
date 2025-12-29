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
    let resolved = false;

    // 🔒 Fail-safe: never block UI forever
    const timeout = setTimeout(() => {
      if (!resolved) {
        setAuthChecked(true);
      }
    }, 1500);

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getUser();
        resolved = true;

        const currentUser = data.user;
        setUser(currentUser);

        if (!currentUser) {
          setIsSubscriber(false);
          setAuthChecked(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", currentUser.id)
          .single();

        setIsSubscriber(profile?.subscription_status === "active");
        setAuthChecked(true);
      } catch {
        setAuthChecked(true);
      } finally {
        clearTimeout(timeout);
      }
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          setIsSubscriber(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", currentUser.id)
          .single();

        setIsSubscriber(profile?.subscription_status === "active");
      }
    );

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
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



