import type { CurrentUser } from "@/lib/current-user";

const AUTH_TOKEN_KEY = "cocs_access_token";
const AUTH_USER_KEY = "cocs_auth_user";

export function saveAuthSession(params: {
  accessToken: string;
  user: CurrentUser;
}) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, params.accessToken);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(params.user));
  window.localStorage.setItem("cocs_user_role", params.user.role);
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem("cocs_user_role");
}
