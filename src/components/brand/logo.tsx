import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="logo" href={href} aria-label="JobAI home">
      <span className="logo-mark">
        <Sparkles className="ic" />
      </span>
      <span>
        Job<b>AI</b>
      </span>
    </Link>
  );
}
