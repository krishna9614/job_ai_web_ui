import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";

export default function NotFound() {
  return (
    <AuthShell
      variant="right"
      topRight={
        <>
          New to JobAI? <Link href="/signup">Create an account</Link>
        </>
      }
    >
      <div className="auth-card center">
        <h2>
          Page not <span className="hl">found</span>
        </h2>
        <p className="sub">The page you’re looking for doesn’t exist or has moved.</p>
        <Link className="back-link" href="/">
          <ArrowLeft className="ic ic-sm" />
          Back to home
        </Link>
      </div>
    </AuthShell>
  );
}
