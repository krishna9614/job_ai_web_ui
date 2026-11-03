import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, clearSessionCookies, postBackend } from "@/lib/server/backend";

/** Revokes the Supabase session (refresh token) and drops the session cookies. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) await postBackend("auth/logout", undefined, token);
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}
