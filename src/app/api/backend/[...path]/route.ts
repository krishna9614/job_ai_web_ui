import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  backendUrl,
  errorResponse,
  readJson,
  unreachableResponse,
} from "@/lib/server/backend";

type Context = { params: Promise<{ path: string[] }> };

/**
 * Forwards authenticated calls to the FastAPI backend, attaching the access token from the
 * HttpOnly cookie as a Bearer header. Auth endpoints are excluded: they go through /api/auth/*.
 */
async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (path[0] === "auth") return errorResponse(404, "Not found", "not_found");

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return errorResponse(401, "Missing bearer token", "not_authenticated");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let response: Response;
  try {
    response = await fetch(backendUrl(path.map(encodeURIComponent).join("/")) + request.nextUrl.search, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return unreachableResponse();
  }

  const data = await readJson(response);
  const result =
    data === null
      ? new NextResponse(null, { status: response.status })
      : NextResponse.json(data, { status: response.status });
  if (response.status === 401) result.cookies.delete(ACCESS_TOKEN_COOKIE);
  return result;
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
