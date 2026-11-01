import axios from "axios";
import { toApiError } from "./errors";

/**
 * Browser HTTP client. It talks to this app's own route handlers (`/api/*`), which hold the
 * Supabase access token in an HttpOnly cookie and forward requests to the FastAPI backend
 * configured by NEXT_PUBLIC_API_BASE_URL. The token is never readable from JavaScript.
 */
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 20_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Registered once by the auth provider to react to expired or invalid sessions. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

const AUTH_ENTRY_POINTS = ["/auth/login", "/auth/signup"];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const url: string = error?.config?.url ?? "";
    if (apiError.isUnauthorized && !AUTH_ENTRY_POINTS.some((p) => url.startsWith(p))) {
      onUnauthorized?.();
    }
    return Promise.reject(apiError);
  },
);
