import mmkvStorage from "@/utils/storage/mmkvStorage";
import { STORAGE_KEYS, AuthSession } from "./types";
import { AccountRole } from "@/constants/enums";

export const setAuthSession = (session: AuthSession) => {
  mmkvStorage.set(STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
  mmkvStorage.set(STORAGE_KEYS.USER_ROLE, session.role);
  mmkvStorage.set(STORAGE_KEYS.USER_EMAIL, session.email);
  if (session.user_id) {
    mmkvStorage.set(STORAGE_KEYS.USER_ID, session.user_id);
  }
};

export const getAccessToken = (): string | undefined => {
  return mmkvStorage.getString(STORAGE_KEYS.ACCESS_TOKEN);
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const getUserRole = (): AccountRole | undefined => {
  const role = mmkvStorage.getString(STORAGE_KEYS.USER_ROLE);
  return role as AccountRole | undefined;
};

export const getUserEmail = (): string | undefined => {
  return mmkvStorage.getString(STORAGE_KEYS.USER_EMAIL);
};

export const getUserId = (): string | undefined => {
  return mmkvStorage.getString(STORAGE_KEYS.USER_ID);
};

/** Clears the auth session and any onboarding progress (used on logout). */
export const clearAuthSession = () => {
  mmkvStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  mmkvStorage.remove(STORAGE_KEYS.USER_ROLE);
  mmkvStorage.remove(STORAGE_KEYS.USER_EMAIL);
  mmkvStorage.remove(STORAGE_KEYS.USER_ID);
  mmkvStorage.remove(STORAGE_KEYS.DID_USER_ONBOARD);
};
