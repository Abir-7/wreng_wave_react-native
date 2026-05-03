import { api } from "@/lib/axios/axios";
import { useAuthStore, ValidRole } from "@/store/auth.store";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/api/auth.types";
import { useMutation } from "@tanstack/react-query";

import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

// ===== API CALLS =====
const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
};

const signup = async (payload: SignupRequest): Promise<SignupResponse> => {
  const { data } = await api.post<SignupResponse>("/auth/signup", payload);
  return data;
};

// ===== HOOKS =====
export const useLogin = () => {
  const { setFromResponse } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // ✅ one call sets everything
      setFromResponse({
        user_id: data.user_id,
        role: data.role as ValidRole,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (data.role === "customer") {
        router.replace("/(customer)/home");
      } else if (data.role === "mechanic") {
        router.replace("/(mechanic)/home");
      }
    },
    onError: (error: any) => {
      console.log(error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: errorMessage,
      });
    },
  });
};
export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: signup,
    onSuccess: (_, variables) => {
      router.push({ pathname: "/otp", params: { role: variables.role } });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Signup Error",
        text2: errorMessage,
      });
      console.error("Signup failed:", errorMessage);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return { handleLogout };
};
