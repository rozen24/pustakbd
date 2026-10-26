"use client";

// Authentication context backed by this app's own API routes (PostgreSQL via
// Prisma on the server). The server sets an httpOnly session cookie on login /
// sign-up and clears it on logout; the browser sends it automatically, so no
// tokens are handled here.
//
// Expected API contract (src/app/api/...):
//   GET  /auth/me               -> Profile | null   (200 with null when logged out)
//   POST /auth/login            { email, password } -> Profile   (sets cookie)
//   POST /signup                { name, email, password, role } -> Profile (sets cookie)
//   POST /auth/logout           -> { ok: true }     (clears cookie)
//   POST /auth/forgot-password  { email } -> { ok: true }
//   PUT  /profile               patch -> Profile
//   POST /profile/address       address -> Profile

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../services/api/client";
import type { Address, Profile } from "../../types";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signUp(input: { name: string; email: string; password: string; role?: "customer" | "seller" }): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updateProfile(patch: Partial<Profile>): Promise<void>;
  saveAddress(address: Address): Promise<void>;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await api.get<Profile | null>("/auth/me");
      setUser(profile ?? null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadProfile();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const signUp: AuthState["signUp"] = useCallback(async ({ name, email, password, role = "customer" }) => {
    const profile = await api.post<Profile>("/signup", { name, email, password, role });
    setUser(profile);
  }, []);

  const signIn: AuthState["signIn"] = useCallback(async (email, password) => {
    const profile = await api.post<Profile>("/auth/login", { email, password });
    setUser(profile);
  }, []);

  const signInWithGoogle: AuthState["signInWithGoogle"] = useCallback(async () => {
    // Not configured yet. Add an OAuth provider (e.g. Auth.js Google) and
    // redirect to its sign-in route here.
    throw new Error("Google sign-in is not set up yet.");
  }, []);

  const signOut: AuthState["signOut"] = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      setUser(null);
    }
  }, []);

  const requestPasswordReset: AuthState["requestPasswordReset"] = useCallback(async (email) => {
    await api.post("/auth/forgot-password", { email });
  }, []);

  const updateProfile: AuthState["updateProfile"] = useCallback(async (patch) => {
    const updated = await api.put<Profile>("/profile", patch);
    setUser(updated);
  }, []);

  const saveAddress: AuthState["saveAddress"] = useCallback(async (address) => {
    const updated = await api.post<Profile>("/profile/address", address);
    setUser(updated);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, loading, signUp, signIn, signInWithGoogle, signOut,
    requestPasswordReset, updateProfile, saveAddress, refresh: loadProfile,
  }), [user, loading, signUp, signIn, signInWithGoogle, signOut, requestPasswordReset, updateProfile, saveAddress, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}