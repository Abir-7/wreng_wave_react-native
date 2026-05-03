import { DecodedToken } from "@/types/api/auth.types";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

export type ValidRole = "customer" | "mechanic"; // ✅ "customer" not "customer"

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  role: ValidRole | null;
  user_id: string | null;
  user_email: string | null;

  setTokens: (access: string, refresh: string) => void;
  setFromResponse: (res: {
    user_id: string;
    role: ValidRole;
    access_token: string;
    refresh_token: string;
  }) => void;
  decodeToken: () => DecodedToken | null;
  isTokenExpired: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  access_token: null,
  refresh_token: null,
  role: null,
  user_id: null,
  user_email: null,

  // ✅ set both tokens
  setTokens: (access, refresh) =>
    set({ access_token: access, refresh_token: refresh }),

  // ✅ set everything from login response in one call
  setFromResponse: (res) =>
    set({
      access_token: res.access_token,
      refresh_token: res.refresh_token,
      role: res.role,
      user_id: res.user_id,
    }),

  // ✅ decode access token
  decodeToken: () => {
    const token = get().access_token;
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  },

  // ✅ check expiry using access_token_valid_till equivalent
  isTokenExpired: () => {
    const token = get().access_token;
    if (!token) return true;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  logout: () =>
    set({
      access_token: null,
      refresh_token: null,
      role: null,
      user_id: null,
      user_email: null,
    }),
}));
