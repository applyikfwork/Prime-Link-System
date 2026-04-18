import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/db";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("prime_link_session");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem("prime_link_session");
        setUser(stored ? (JSON.parse(stored) as User) : null);
      } catch {
        setUser(null);
      }
    };

    const heartbeatId = setInterval(async () => {
      const stored = localStorage.getItem("prime_link_session");
      if (stored) {
        try {
          const u = JSON.parse(stored) as User;
          await supabase
            .from("users")
            .update({ online: true, last_seen_at: new Date().toISOString() })
            .eq("id", u.id);
        } catch {}
      }
    }, 30000);

    const handleUnload = () => {
      const stored = localStorage.getItem("prime_link_session");
      if (stored) {
        try {
          const u = JSON.parse(stored) as User;
          supabase.from("users").update({ online: false }).eq("id", u.id);
        } catch {}
      }
    };

    window.addEventListener("prime_link_auth_change", handleAuthChange);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeatId);
      window.removeEventListener("prime_link_auth_change", handleAuthChange);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
