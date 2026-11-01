import "server-only";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  backendUrl,
  cookieOptions,
  errorResponse,
  readJson,
  unreachableResponse,
} from "./backend";

interface BackendSession {
  access_token: string;
  expires_in: number | null;
}

interface BackendAuthBody {
  user: unknown;
  session: BackendSession | null;
  email_confirmation_required?: boolean;
}

interface AuthRequestBody {
  email?: unknown;
  password?: unknown;
  remember?: unknown;
}

/**
 * Calls the backend's /auth/login or /auth/signup and moves the returned access token into an
 * HttpOnly cookie. The browser only ever receives the user object.
 */
export async function forwardAuth(request: Request, endpoint: "auth/login" | "auth/signup") {
  let body: AuthRequestBody;
  try {
    body = (await request.json()) as AuthRequestBody;
  } catch {
    return errorResponse(400, "Invalid request body", "bad_request");
  }

  let response: Response;
  try {
    response = await fetch(backendUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
  } catch {
    return unreachableResponse();
  }

  const data = await readJson(response);
  if (!response.ok) return NextResponse.json(data, { status: response.status });

  const auth = data as BackendAuthBody;
  const result = NextResponse.json(
    endpoint === "auth/signup"
      ? { user: auth.user, email_confirmation_required: auth.session === null }
      : { user: auth.user },
    { status: response.status },
  );
  if (auth.session?.access_token) {
    // "Remember me" keeps the cookie for the token's lifetime; otherwise it is a session cookie.
    const persist = endpoint === "auth/signup" || body.remember === true;
    result.cookies.set(
      ACCESS_TOKEN_COOKIE,
      auth.session.access_token,
      cookieOptions(persist ? (auth.session.expires_in ?? 3600) : undefined),
    );
  }
  return result;
}
