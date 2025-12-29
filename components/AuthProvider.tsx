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

    async function initAuth() {
      const { data } = await supabase.auth.getUser();
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


