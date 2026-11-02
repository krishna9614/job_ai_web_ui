import { NextResponse, type NextRequest } from "next/server";
import {
  RECOVERY_TOKEN_COOKIE,
  clearRecoveryCookie,
  clearSessionCookies,
  errorResponse,
  postBackend,
  readBody,
  readJson,
  unreachableResponse,
} from "@/lib/server/backend";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(RECOVERY_TOKEN_COOKIE)?.value;
  if (!token) {
    return errorResponse(401, "Your reset link has expired. Please request a new one.", "recovery_expired");
  }
  const body = await readBody(request);
  if (!body) return errorResponse(400, "Invalid request body", "bad_request");

  const response = await postBackend("auth/password/reset", { password: body.password }, token);
  if (!response) return unreachableResponse();
  const data = await readJson(response);
  const result = NextResponse.json(data, { status: response.status });
  if (response.ok) {
    // The backend revoked every session; drop this browser's cookies too.
    clearRecoveryCookie(result);
    clearSessionCookies(result);
  } else if (response.status === 401 || response.status === 403) {
    clearRecoveryCookie(result);
  }
  return result;
}
