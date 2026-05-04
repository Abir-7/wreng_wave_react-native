import { api } from "@/lib/axios/axios";
import { useAuthStore, ValidRole } from "@/store/auth.store";
import {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SignupRequest,
  SignupResponse,
  VerifyResetPayload,
  VerifyResetResponse,
  VerifyUserPayload,
  VerifyUserResponse,
} from "@/types/api/auth.types";
import { useMutation } from "@tanstack/react-query";

import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

// ===== HOOKS =====
export const useLogin = () => {
  const { setFromResponse } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginRequest): Promise<LoginResponse> => {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Welcome! You are logged in.",
      });
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
    mutationFn: async (payload: SignupRequest): Promise<SignupResponse> => {
      const { data } = await api.post<SignupResponse>("/auth/signup", payload);
      return data;
    },
    onSuccess: (data, variables) => {
      Toast.show({
        type: "success",
        text1: "Successful",
        text2: "Please check your email to verify your account",
      });
      router.push({
        pathname: "/otp",
        params: { role: variables.role, user_id: data.user_id },
      });
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

export const useVerifyUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: VerifyUserPayload) => {
      const { data } = await api.post<VerifyUserResponse>("/auth/verify-user", {
        user_id: payload.user_id,
        code: payload.code,
      });
      return data;
    },
    onSuccess: (_, payload) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "You are verified. You can now login.",
      });
      if (payload.flow === "forgot-password") {
        router.push({
          pathname: "/reset-password",
          params: { role: payload.role },
        });
      } else {
        router.push({ pathname: "/login", params: { role: payload.role } });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Verification failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: errorMessage,
      });
      console.error("Verification failed:", errorMessage);
    },
  });
};

export const useResendCode = () => {
  return useMutation({
    mutationFn: async (payload: ResendOtpPayload) => {
      const { data } = await api.post<ResendOtpResponse>("/auth/resend-code", {
        user_id: payload.user_id,
      });
      return data;
    },
    onSuccess: (_, payload) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Code resent successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Resend Code failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: errorMessage,
      });
      console.error("Verification failed:", errorMessage);
    },
  });
};

export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const { data } = await api.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        {
          email: payload.email,
        },
      );
      return data;
    },
    onSuccess: (res, payload) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Code resent successfully.",
      });
      router.push({
        pathname: "/otp",
        params: {
          role: payload.role,
          flow: "forgot-password",
          user_id: res.user_id,
        },
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Resend Code failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: errorMessage,
      });
      console.error("Verification failed:", errorMessage);
    },
  });
};

export const useVerifyResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: VerifyResetPayload) => {
      const { data } = await api.post<VerifyResetResponse>(
        "/auth/verify-password-reset",
        {
          user_id: payload.user_id,
          code: payload.code,
        },
      );
      return data;
    },
    onSuccess: (_, payload) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Verification successfull.",
      });
      router.replace({
        pathname: "/reset-password",
        params: { role: payload.role },
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || " Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: errorMessage,
      });
      console.error("Verification failed:", errorMessage);
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const { data } = await api.post<ResetPasswordResponse>(
        "/auth/reset-password",
        {
          user_id: payload.user_id,
          password: payload.password,
        },
      );
      return data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password reset successfully.",
      });
      router.replace("/");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || " Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: errorMessage,
      });
      console.error("Verification failed:", errorMessage);
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
