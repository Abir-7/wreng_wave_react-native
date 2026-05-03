import { create } from "zustand";

export type ValidRole = "user" | "mechanic";

interface AuthState {
  token: string | null;
  role: ValidRole | null;
  user: any | null;
  setRole: (role: ValidRole | null) => void;
  setToken: (token: string | null) => void; // ✅ added to interface
  setUser: (user: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  user: null,
  token: null,
  setRole: (role) => set({ role }),
  setToken: (token) => set({ token }), // ✅ already correct
  setUser: (user) => set({ user }),
  logout: () => set({ role: null, user: null, token: null }), // ✅ clear token too
}));
