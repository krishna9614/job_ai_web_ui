import { NextResponse } from "next/server";
import {
  errorResponse,
  postBackend,
  readBody,
  readJson,
  setRecoveryStateCookie,
  unreachableResponse,
} from "@/lib/server/backend";

/** Sends the reset email; the backend's sealed PKCE verifier stays in an HttpOnly cookie. */
export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return errorResponse(400, "Invalid request body", "bad_request");
  const response = await postBackend("auth/password/forgot", { email: body.email });
  if (!response) return unreachableResponse();
  const data = await readJson(response);
  if (!response.ok) return NextResponse.json(data, { status: response.status });

  const { detail, recovery_state } = data as { detail: string; recovery_state: string };
  const result = NextResponse.json({ detail }, { status: response.status });
  setRecoveryStateCookie(result, recovery_state);
  return result;
}
