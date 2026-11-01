/** ISO 3166-1 alpha-2 codes offered in the profile forms, with their dialling codes. */
export const COUNTRIES = [
  { code: "US", name: "United States", dial: "1" },
  { code: "CA", name: "Canada", dial: "1" },
  { code: "GB", name: "United Kingdom", dial: "44" },
  { code: "IE", name: "Ireland", dial: "353" },
  { code: "IN", name: "India", dial: "91" },
  { code: "AU", name: "Australia", dial: "61" },
  { code: "NZ", name: "New Zealand", dial: "64" },
  { code: "SG", name: "Singapore", dial: "65" },
  { code: "AE", name: "United Arab Emirates", dial: "971" },
  { code: "DE", name: "Germany", dial: "49" },
  { code: "FR", name: "France", dial: "33" },
  { code: "NL", name: "Netherlands", dial: "31" },
  { code: "ES", name: "Spain", dial: "34" },
  { code: "IT", name: "Italy", dial: "39" },
  { code: "SE", name: "Sweden", dial: "46" },
  { code: "CH", name: "Switzerland", dial: "41" },
  { code: "PL", name: "Poland", dial: "48" },
  { code: "PT", name: "Portugal", dial: "351" },
  { code: "BR", name: "Brazil", dial: "55" },
  { code: "MX", name: "Mexico", dial: "52" },
  { code: "JP", name: "Japan", dial: "81" },
  { code: "KR", name: "South Korea", dial: "82" },
  { code: "CN", name: "China", dial: "86" },
  { code: "ZA", name: "South Africa", dial: "27" },
  { code: "NG", name: "Nigeria", dial: "234" },
  { code: "IL", name: "Israel", dial: "972" },
] as const;

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ?? code.toUpperCase();
}

export const DIAL_CODES = Array.from(new Set(COUNTRIES.map((c) => c.dial))).sort((a, b) => Number(a) - Number(b));
