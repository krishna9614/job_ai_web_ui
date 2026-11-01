import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/server/backend";

/** The backend has no logout endpoint; ending the session means dropping the token cookie. */
export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
