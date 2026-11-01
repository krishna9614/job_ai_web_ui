import { forwardAuth } from "@/lib/server/auth-route";

export async function POST(request: Request) {
  return forwardAuth(request, "auth/signup");
}
