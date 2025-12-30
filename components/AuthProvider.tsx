"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: any | null;
  isLoggedIn: boolean;
  isSubscriber: boolean;
  authChecked: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isSubscriber: false,
  authChecked: false,
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  async function refreshAuth() {
    try {
      setAuthChecked(false);

      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();

      if (!data.user) {
        setUser(null);
        setIsSubscriber(false);
        return;
      }

      setUser(data.user);

      const profileRes = await fetch("/api/me", { cache: "no-store" });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setIsSubscriber(profile.subscription_status === "active");
      } else {
        setIsSubscriber(false);
      }
    } catch (err) {
      console.error("Auth refresh error:", err);
      setUser(null);
      setIsSubscriber(false);
    } finally {
      setAuthChecked(true);
    }
  }

  // Initial hydration
  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isSubscriber,
        authChecked,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}







