import "server-only";
import { NextResponse } from "next/server";
import {
  errorResponse,
  postBackend,
  readBody,
  readJson,
  setSessionCookies,
  unreachableResponse,
  type BackendSession,
} from "./backend";

interface BackendAuthBody {
  user: unknown;
  session: BackendSession | null;
  email_confirmation_required?: boolean;
}

/**
 * Calls the backend's /auth/login or /auth/signup and moves the returned tokens into HttpOnly
 * cookies. The browser only ever receives the user object.
 */
export async function forwardAuth(request: Request, endpoint: "auth/login" | "auth/signup") {
  const body = await readBody(request);
  if (!body) return errorResponse(400, "Invalid request body", "bad_request");

  const payload =
    endpoint === "auth/signup"
      ? { full_name: body.full_name, email: body.email, password: body.password }
      : { email: body.email, password: body.password };
  const response = await postBackend(endpoint, payload);
  if (!response) return unreachableResponse();

  const data = await readJson(response);
  if (!response.ok) return NextResponse.json(data, { status: response.status });

  const auth = data as BackendAuthBody;
  const result = NextResponse.json(
    endpoint === "auth/signup"
      ? { user: auth.user, email_confirmation_required: auth.session === null }
      : { user: auth.user },
    { status: response.status },
  );
  if (auth.session?.access_token) setSessionCookies(result, auth.session, body.remember === true);
  return result;
}

/** Forwards an unauthenticated JSON call (only the listed fields) and relays the response. */
export async function forwardPublic(request: Request, endpoint: string, fields: readonly string[]) {
  const body = await readBody(request);
  if (!body) return errorResponse(400, "Invalid request body", "bad_request");
  const response = await postBackend(endpoint, Object.fromEntries(fields.map((f) => [f, body[f]])));
  if (!response) return unreachableResponse();
  return NextResponse.json(await readJson(response), { status: response.status });
}
