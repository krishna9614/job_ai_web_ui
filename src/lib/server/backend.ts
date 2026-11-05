import "server-only";
import { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "jobai_access_token";

export function backendBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  return url.replace(/\/+$/, "");
}

export function backendUrl(path: string): string {
  return `${backendBaseUrl()}/api/v1/${path.replace(/^\/+/, "")}`;
}

export function errorResponse(status: number, detail: string, code: string) {
  return NextResponse.json({ detail, code }, { status });
}

export function unreachableResponse() {
  return errorResponse(502, "We couldn't reach the JobAI API. Please try again shortly.", "backend_unreachable");
}

export async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}

export const REFRESH_TOKEN_COOKIE = "jobai_refresh_token";
/** Marks a "Remember me" login so refreshed tokens keep the persistent lifetime. */
export const REMEMBER_COOKIE = "jobai_remember";
/** Short-lived session from an emailed reset link; only usable for /auth/password/reset. */
export const RECOVERY_TOKEN_COOKIE = "jobai_recovery_token";

export const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30;
const RECOVERY_MAX_AGE = 60 * 15;

export interface BackendSession {
  access_token: string;
  refresh_token: string | null;
  expires_in: number | null;
}

type CookieJar = { cookies: NextResponse["cookies"] };

/**
 * Stores the Supabase session in HttpOnly cookies. With "Remember me" the cookies last 30 days
 * (the refresh token renews the short-lived access token); otherwise they end with the browser.
 */
export function setSessionCookies(response: CookieJar, session: BackendSession, remember: boolean) {
  const maxAge = remember ? REMEMBER_ME_MAX_AGE : undefined;
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, cookieOptions(maxAge));
  if (session.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, cookieOptions(maxAge));
  }
  if (remember) response.cookies.set(REMEMBER_COOKIE, "1", cookieOptions(maxAge));
  else response.cookies.delete(REMEMBER_COOKIE);
}

export function clearSessionCookies(response: CookieJar) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(REMEMBER_COOKIE);
}

export function setRecoveryCookie(response: CookieJar, token: string, maxAge = RECOVERY_MAX_AGE) {
  const options = cookieOptions(Math.min(maxAge, RECOVERY_MAX_AGE));
  response.cookies.set(RECOVERY_TOKEN_COOKIE, token, { ...options, path: "/api/auth" });
}

export function clearRecoveryCookie(response: CookieJar) {
  response.cookies.set(RECOVERY_TOKEN_COOKIE, "", { ...cookieOptions(), path: "/api/auth", maxAge: 0 });
}

/** POST JSON to the backend; returns null when it is unreachable. */
export async function postBackend(path: string, body?: unknown, token?: string): Promise<Response | null> {
  try {
    return await fetch(backendUrl(path), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

/** Exchanges a refresh token for a new session (refresh tokens are single use). */
export async function refreshSession(refreshToken: string): Promise<BackendSession | null> {
  const response = await postBackend("auth/refresh", { refresh_token: refreshToken });
  if (!response?.ok) return null;
  const data = (await readJson(response)) as { session?: BackendSession } | null;
  return data?.session?.access_token ? data.session : null;
}

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
