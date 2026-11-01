import { Globe, IdCard, MapPin, ScrollText, type LucideIcon } from "lucide-react";
import type { ProfileFields } from "@/types/api";

export type SectionId = "personal" | "contact" | "professional" | "links";

export interface ProfileSection {
  id: SectionId;
  title: string;
  caption: string;
  icon: LucideIcon;
  fields: (keyof ProfileFields)[];
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: "personal",
    title: "Personal information",
    caption: "How you appear to recruiters",
    icon: IdCard,
    fields: ["first_name", "middle_name", "last_name", "preferred_name"],
  },
  {
    id: "contact",
    title: "Contact & location",
    caption: "Where employers can reach you",
    icon: MapPin,
    fields: ["phone_country_code", "phone_number", "city", "state_province", "country_code"],
  },
  {
    id: "professional",
    title: "Professional summary",
    caption: "Used to tailor every application",
    icon: ScrollText,
    fields: ["professional_headline", "professional_summary"],
  },
  {
    id: "links",
    title: "Online presence",
    caption: "Profiles that showcase your work",
    icon: Globe,
    fields: ["linkedin_url", "github_url"],
  },
];

export const FIELD_LABELS: Record<keyof ProfileFields, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  preferred_name: "Preferred name",
  phone_country_code: "Country code",
  phone_number: "Phone number",
  city: "City",
  state_province: "State / province",
  country_code: "Country",
  professional_headline: "Professional headline",
  professional_summary: "Professional summary",
  linkedin_url: "LinkedIn",
  github_url: "GitHub",
};
