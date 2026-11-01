import { COUNTRIES } from "./countries";

const ALIASES: Record<string, string> = { USA: "US", "U.S.": "US", "U.S.A.": "US", UK: "GB", UAE: "AE", ENGLAND: "GB" };

function toCountryCode(token: string): string | null {
  const t = token.trim().toUpperCase();
  if (ALIASES[t]) return ALIASES[t];
  const match = COUNTRIES.find((c) => c.code === t || c.name.toUpperCase() === t);
  return match?.code ?? null;
}

/**
 * The onboarding design collects location as one "City, State, Country" field; the API stores
 * city, state_province and country_code separately.
 */
export function parseLocation(input: string): { city: string; state_province: string; country_code: string } {
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  let country_code = "";
  if (parts.length > 1) {
    const code = toCountryCode(parts[parts.length - 1]);
    if (code) {
      country_code = code;
      parts.pop();
    }
  } else if (parts.length === 1 && toCountryCode(parts[0])) {
    return { city: "", state_province: "", country_code: toCountryCode(parts[0]) ?? "" };
  }
  return { city: parts[0] ?? "", state_province: parts.slice(1).join(", "), country_code };
}

export function splitFullName(fullName: string): { first_name: string; middle_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first_name: parts[0] ?? "", middle_name: "", last_name: "" };
  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}
