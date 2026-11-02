import { NextResponse, type NextRequest } from "next/server";
import {
  RECOVERY_TOKEN_COOKIE,
  errorResponse,
  postBackend,
  readBody,
  readJson,
  setRecoveryCookie,
  unreachableResponse,
  type BackendSession,
} from "@/lib/server/backend";

/** Whether a reset link was already exchanged in this browser (survives a page reload). */
export async function GET(request: NextRequest) {
  return NextResponse.json({ active: Boolean(request.cookies.get(RECOVERY_TOKEN_COOKIE)?.value) });
}

/** Consumes the one-time token_hash from the reset email; the session stays in an HttpOnly cookie. */
export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body || typeof body.token_hash !== "string") {
    return errorResponse(400, "This link is invalid, has expired or has already been used", "invalid_token");
  }
  const response = await postBackend("auth/password/recovery", { token_hash: body.token_hash });
  if (!response) return unreachableResponse();
  const data = await readJson(response);
  if (!response.ok) return NextResponse.json(data, { status: response.status });

  const session = (data as { session: BackendSession }).session;
  const result = NextResponse.json({ active: true });
  setRecoveryCookie(result, session.access_token);
  return result;
}
