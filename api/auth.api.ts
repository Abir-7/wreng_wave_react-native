import { api } from "@/lib/axios/axios";
import { useAuthStore } from "@/store/auth.store";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/api/auth.types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

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
  const { setToken, setUser, setRole } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role as any);
      router.replace("/home");
    },
    onError: (error: any) => {
      console.error("Login failed:", error.response?.data?.message);
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
      console.error("Signup failed:", error.response?.data?.message);
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
