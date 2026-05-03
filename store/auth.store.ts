import { create } from "zustand";

export type Role = "user" | "mechanic" | null;
export type ValidRole = Exclude<Role, null>;
type User = {
  user_id: string;
  full_name: string;
  email: string;
  avatar: string | null;
};

interface AuthState {
  role: Role;
  token: string | null;
  user: User | null;

  setRole: (role: Role) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  token: null,
  user: null,

  setRole: (role) => set({ role }),
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  logout: () => set({ role: null, token: null, user: null }),
}));
