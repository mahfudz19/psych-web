import { useSyncExternalStore } from "react";
import type { User } from "../types/user";

type AuthState = {
  user: User | null;
  accessToken: string | null;
};

const loadState = (): AuthState => {
  try {
    const stored = localStorage.getItem("psych_auth_state");
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Gagal membaca auth state", error);
  }
  return { user: null, accessToken: null };
};

let state: AuthState = loadState();
const listeners = new Set<() => void>();

export const authStore = {
  get: () => state,

  set: (newState: Partial<AuthState>) => {
    state = { ...state, ...newState };
    localStorage.setItem("psych_auth_state", JSON.stringify(state));
    listeners.forEach((cb) => cb());
  },

  clear: () => {
    state = { user: null, accessToken: null };
    localStorage.removeItem("psych_auth_state");
    listeners.forEach((cb) => cb());
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  isAuthenticated: () => !!state.accessToken && !!state.user,
};

export const useAuthStore = () =>
  useSyncExternalStore(authStore.subscribe, authStore.get);
