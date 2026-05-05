import { DecodedToken } from "@/types/api/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ValidRole = "customer" | "mechanic";

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  role: ValidRole | null;
  user_id: string | null;
  user_email: string | null;
  is_user_car_data_complete: boolean;
  is_mechanic_data_complete: boolean;

  setTokens: (access: string, refresh: string) => void;
  setFromResponse: (res: {
    user_id: string;
    role: ValidRole;
    access_token: string;
    refresh_token: string;
    is_user_car_data_complete?: boolean;
    is_mechanic_data_complete?: boolean;
  }) => void;
  decodeToken: () => DecodedToken | null;
  isTokenExpired: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      role: null,
      user_id: null,
      user_email: null,
      is_user_car_data_complete: false,
      is_mechanic_data_complete: false,

      setTokens: (access, refresh) =>
        set({ access_token: access, refresh_token: refresh }),

      setFromResponse: (res) =>
        set({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
          role: res.role,
          user_id: res.user_id,
          is_user_car_data_complete: res.is_user_car_data_complete ?? false,
          is_mechanic_data_complete: res.is_mechanic_data_complete ?? false,
        }),

      decodeToken: () => {
        const token = get().access_token;
        if (!token) return null;
        try {
          return jwtDecode<DecodedToken>(token);
        } catch {
          return null;
        }
      },

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
    }),
    {
      name: "auth-storage", // ✅ AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage), // ✅ use AsyncStorage
      partialize: (state) => ({
        // ✅ only persist these fields
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        role: state.role,
        user_id: state.user_id,
        user_email: state.user_email,
        is_user_car_data_complete: state.is_user_car_data_complete,
        is_mechanic_data_complete: state.is_mechanic_data_complete,
      }),
    },
  ),
);
