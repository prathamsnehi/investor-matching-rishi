import { apiClient } from "./client";
import { AccountRole } from "@/constants/enums";

export interface SignupRequest {
  full_name: string;
  email_address: string;
  mobile_number: string;
  password: string;
  role: AccountRole;
  linkedin_profile_url?: string | null;
}

export interface SignupResponse {
  status: number;
  message: string;
  email: string;
  user_id: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  email: string;
  role: AccountRole;
}

export const signup = (payload: SignupRequest) =>
  apiClient.postJson<SignupResponse>("/auth/signup", payload, false);

/** OAuth2 password flow: email is sent as `username`, form-urlencoded. */
export const login = (email: string, password: string) =>
  apiClient.postForm<LoginResponse>("/auth/login", {
    username: email,
    password,
  });

export const logout = () =>
  apiClient.postJson<{ status: number; message: string }>("/auth/logout", {});

export const changePassword = (oldPassword: string, newPassword: string) =>
  apiClient.postJson<{ status: number; message: string }>("/auth/change_password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
