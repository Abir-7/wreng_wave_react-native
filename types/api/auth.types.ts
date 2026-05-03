// ===== REQUESTS =====
export type LoginRequest = {
  email: string;
  password: string;
  role: string;
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
  token: string;
  user: AuthUser;
};

export type SignupResponse = {
  message: string;
  email: string;
};
