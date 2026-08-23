import React, { createContext, useContext, useEffect, useState } from "https://esm.sh/react@18.3.1";
import { supabase } from "../lib/supabaseClient.js";
import { html } from "../lib/html.js";

const AuthContext = createContext({
  user: null,
  role: null, // "admin" | "client" | null
  loading: true,
  signInWithPassword: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadRole(currentUser) {
    if (!currentUser) {
      setRole(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (error) {
      console.error("[AuthContext] Failed to load profile role:", error.message);
      setRole("client"); // safe default — never assume admin on error
      return;
    }
    setRole(data?.role || "client");
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      loadRole(session?.user ?? null).finally(() => mounted && setLoading(false));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadRole(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return html`
    <${AuthContext.Provider}
      value=${{ user, role, loading, signInWithPassword, signInWithGoogle, signOut }}
    >
      ${children}
    <//>
  `;
}

export function useAuth() {
  return useContext(AuthContext);
}
