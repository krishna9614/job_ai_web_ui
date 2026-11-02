import { forwardPublic } from "@/lib/server/auth-route";

export async function POST(request: Request) {
  return forwardPublic(request, "auth/password/forgot", ["email"]);
}
