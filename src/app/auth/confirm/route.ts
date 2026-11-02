import { NextResponse, type NextRequest } from "next/server";
import { postBackend, readJson, setSessionCookies, type BackendSession } from "@/lib/server/backend";

const TYPES = new Set(["signup", "email", "email_change"]);

interface ConfirmBody {
  session: BackendSession | null;
  confirmation_pending: boolean;
}

/**
 * Target of the verification and email-change links (Supabase templates link here with
 * token_hash). The token is verified server-side and the resulting session stored in cookies.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") ?? "";
  const redirect = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!tokenHash || !TYPES.has(type)) return redirect("/verify-email?status=invalid");

  const response = await postBackend("auth/email/confirm", { token_hash: tokenHash, type });
  if (!response) return redirect("/verify-email?status=unavailable");
  if (!response.ok) {
    return redirect(type === "email_change" ? "/dashboard?email=invalid" : "/verify-email?status=invalid");
  }

  const data = (await readJson(response)) as ConfirmBody;
  if (data.confirmation_pending || !data.session) return redirect("/dashboard?email=pending");

  const result = redirect(type === "email_change" ? "/dashboard?email=changed" : "/onboarding/basic?verified=1");
  const remember = request.cookies.get("jobai_remember")?.value === "1";
  setSessionCookies(result, data.session, remember);
  return result;
}
