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
