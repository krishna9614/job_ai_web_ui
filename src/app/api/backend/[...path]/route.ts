import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_COOKIE,
  backendUrl,
  clearSessionCookies,
  errorResponse,
  readJson,
  refreshSession,
  setSessionCookies,
  unreachableResponse,
  type BackendSession,
} from "@/lib/server/backend";

type Context = { params: Promise<{ path: string[] }> };

/**
 * Forwards authenticated calls to the FastAPI backend, attaching the access token from the
 * HttpOnly cookie as a Bearer header. When the access token has expired, the refresh token is
 * exchanged once and the call retried. Auth endpoints are excluded: they go through /api/auth/*.
 */
async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (path[0] === "auth") return errorResponse(404, "Not found", "not_found");

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!accessToken && !refreshToken) return errorResponse(401, "Missing bearer token", "not_authenticated");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;
  const url = backendUrl(path.map(encodeURIComponent).join("/")) + request.nextUrl.search;
  const send = (token: string) =>
    fetch(url, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });

  let response: Response | null = null;
  let renewed: BackendSession | null = null;
  try {
    if (accessToken) response = await send(accessToken);
    if ((!response || response.status === 401) && refreshToken) {
      renewed = await refreshSession(refreshToken);
      if (renewed) response = await send(renewed.access_token);
    }
  } catch {
    return unreachableResponse();
  }
  if (!response) return errorResponse(401, "Your session has expired. Please log in again.", "not_authenticated");

  const data = await readJson(response);
  const result =
    data === null
      ? new NextResponse(null, { status: response.status })
      : NextResponse.json(data, { status: response.status });
  if (response.status === 401) clearSessionCookies(result);
  else if (renewed) setSessionCookies(result, renewed, request.cookies.get(REMEMBER_COOKIE)?.value === "1");
  return result;
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
