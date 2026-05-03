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
};

export type SignupResponse = {
  message: string;
  email: string;
};

export type DecodedToken = {
  user_id: string;
  user_role: string; // ✅ "user_role" not "role"
  user_email: string; // ✅ "user_email" not "email"
  iat: number;
  exp: number;
};
