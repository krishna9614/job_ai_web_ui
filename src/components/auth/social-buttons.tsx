"use client";

import { AppleIcon, GoogleIcon, LinkedinBrandIcon } from "@/components/icons/brand";

const PROVIDERS = [
  { name: "Google", Icon: GoogleIcon },
  { name: "LinkedIn", Icon: LinkedinBrandIcon },
  { name: "Apple", Icon: AppleIcon },
] as const;

/** Social sign-in buttons from the design. The JobAI API only supports email + password today. */
export function SocialButtons({ onSelect }: { onSelect: (provider: string) => void }) {
  return (
    <div className="socials-row">
      {PROVIDERS.map(({ name, Icon }) => (
        <button key={name} type="button" className="social-btn" onClick={() => onSelect(name)} suppressHydrationWarning>
          <Icon className="ic-fill" />
          {name}
        </button>
      ))}
    </div>
  );
}

export function socialUnavailableMessage(provider: string) {
  return `${provider} sign-in isn't available yet. Please continue with your email address.`;
}
