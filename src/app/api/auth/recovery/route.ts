import { NextResponse, type NextRequest } from "next/server";
import {
  RECOVERY_STATE_COOKIE,
  RECOVERY_TOKEN_COOKIE,
  clearRecoveryStateCookie,
  errorResponse,
  postBackend,
  readBody,
  readJson,
  setRecoveryCookie,
  unreachableResponse,
} from "@/lib/server/backend";

/** Whether a reset link was already exchanged in this browser (survives a page reload). */
export async function GET(request: NextRequest) {
  return NextResponse.json({ active: Boolean(request.cookies.get(RECOVERY_TOKEN_COOKIE)?.value) });
}

/**
 * Consumes the reset link: `token_hash` (custom email template) or `code` (Supabase's default
 * template, PKCE, paired with the verifier cookie set by /api/auth/forgot-password). The backend's
 * sealed ticket stays in an HttpOnly cookie.
 */
export async function POST(request: NextRequest) {
  const body = await readBody(request);
  let payload: Record<string, string>;
  if (body && typeof body.token_hash === "string") {
    payload = { token_hash: body.token_hash };
  } else if (body && typeof body.code === "string") {
    const state = request.cookies.get(RECOVERY_STATE_COOKIE)?.value;
    if (!state) {
      return errorResponse(
        400,
        "Open the reset link in the same browser you used to request it, or request a new link.",
        "recovery_state_invalid",
      );
    }
    payload = { code: body.code, recovery_state: state };
  } else {
    return errorResponse(400, "This link is invalid, has expired or has already been used", "invalid_token");
  }
  const response = await postBackend("auth/password/recovery", payload);
  if (!response) return unreachableResponse();
  const data = await readJson(response);
  if (!response.ok) return NextResponse.json(data, { status: response.status });

  const { recovery_token, expires_in } = data as { recovery_token: string; expires_in: number };
  const result = NextResponse.json({ active: true });
  setRecoveryCookie(result, recovery_token, expires_in);
  clearRecoveryStateCookie(result);
  return result;
}
