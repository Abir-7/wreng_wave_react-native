import { ValidRole } from "@/store/auth.store";

// ===== REQUESTS =====
export type LoginRequest = {
  user_email: string;
  password: string;
};

export type SignupRequest = {
  full_name: string;
  email: string;
  password: string;
  role: string;
};

// ===== RESPONSES =====
export type AuthUser = {
  user_id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  access_token_valid_till: number;
  role: ValidRole;
  is_mechanic_data_complete: boolean;
  is_user_car_data_complete: boolean;
};

export type SignupResponse = {
  user_id: string;
  email: string;
  role: ValidRole;
};

export type VerifyUserPayload = {
  user_id: string;
  code: string;
  flow: string;
  role: ValidRole;
};

export type VerifyUserResponse = {
  user_id: string;
  role: ValidRole;
};

export type ResendOtpPayload = {
  user_id: string;
};

export type ResendOtpResponse = {
  message: string;
};

export type ForgotPasswordPayload = {
  email: string;
  role: ValidRole;
};

export type ForgotPasswordResponse = {
  message: string;
  user_id: string;
};

export type VerifyResetPayload = {
  user_id: string;
  code: string;
  role: ValidRole;
};

export type VerifyResetResponse = {
  message: string;
  user_id: string;
  token: string;
};

export type ResetPasswordPayload = {
  user_id: string;
  token: string;
  password: string;
  role: ValidRole;
};

export type ResetPasswordResponse = {
  message: string;
};

export type UpdateLocationPayload = {
  user_id: string;
  latitude: number;
  longitude: number;
};

export type UpdateLocationResponse = {
  message: string;
};

export type DecodedToken = {
  user_id: string;
  user_role: string; // ✅ "user_role" not "role"
  user_email: string; // ✅ "user_email" not "email"
  iat: number;
  exp: number;
};
