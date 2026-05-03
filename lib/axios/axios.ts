/* eslint-disable import/no-named-as-default-member */
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://your-api.com/api", // 🔁 replace with your API URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Auto attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
