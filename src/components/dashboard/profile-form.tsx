"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2, Globe, Link as LinkIcon, MapPin, Phone, Save, User } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { FieldShell, InputBox, TextField } from "@/components/forms/field";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useCreateProfile, useUpdateProfile } from "@/hooks/use-profile";
import { ApiError } from "@/lib/api/errors";
import { COUNTRIES, DIAL_CODES } from "@/lib/profile/countries";
import {
  PROFILE_FIELD_KEYS,
  profileFormSchema,
  profileToForm,
  toCreatePayload,
  toUpdatePayload,
  type ProfileFormValues,
} from "@/lib/profile/schema";
import type { Profile } from "@/types/api";
import { SectionCard } from "./profile-view";
import type { SectionId } from "./sections";

const SUMMARY_MAX = 5000;

type Props = {
  profile: Profile | null;
  focusSection?: SectionId | null;
  onCancel?: () => void;
  onSaved: (message: string) => void;
};

/** Create (POST) or edit (PATCH) the profile. Editing is pre-filled from the stored profile. */
export function ProfileForm({ profile, focusSection, onCancel, onSaved }: Props) {
  const isEdit = profile !== null;
  const create = useCreateProfile();
  const update = useUpdateProfile();
  const mutation = isEdit ? update : create;

  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onTouched",
    defaultValues: profileToForm(profile),
  });

  useEffect(() => {
    const target = focusSection ? document.getElementById(`section-${focusSection}`) : null;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstField: Record<SectionId, Path<ProfileFormValues>> = {
      personal: "first_name",
      contact: "phone_number",
      professional: "professional_headline",
      links: "linkedin_url",
    };
    setFocus(firstField[focusSection ?? "personal"], { shouldSelect: false });
  }, [focusSection, setFocus]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const onSubmit = handleSubmit((values) => {
    const applyServerErrors = (error: unknown) => {
      if (!(error instanceof ApiError)) return;
      for (const [field, message] of Object.entries(error.fieldErrors)) {
        if ((PROFILE_FIELD_KEYS as string[]).includes(field)) {
          setError(field as Path<ProfileFormValues>, { type: "server", message });
        }
      }
    };
    if (profile) {
      const patch = toUpdatePayload(values, profile);
      if (Object.keys(patch).length === 0) {
        onSaved("No changes to save — your profile is up to date.");
        return;
      }
      update.mutate(patch, {
        onSuccess: (saved) => {
          reset(profileToForm(saved));
          onSaved("Your profile has been updated.");
        },
        onError: applyServerErrors,
      });
    } else {
      create.mutate(toCreatePayload(values), {
        onSuccess: (saved) => {
          reset(profileToForm(saved));
          onSaved("Your profile has been created.");
        },
        onError: applyServerErrors,
      });
    }
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : null;
  const summaryLength = useWatch({ control, name: "professional_summary" })?.length ?? 0;
  const errorCount = Object.keys(errors).length;

  return (
    <form className="dash-sections" onSubmit={onSubmit} noValidate aria-label={isEdit ? "Edit profile" : "Create profile"}>
      {apiError ? (
        <Notice tone="err">
          {apiError.status === 409
            ? "A profile already exists for this account. Refresh the page to load it."
            : apiError.message}
        </Notice>
      ) : errorCount > 0 ? (
        <Notice tone="err">Please fix the highlighted {errorCount === 1 ? "field" : "fields"} before saving.</Notice>
      ) : null}

      <SectionCard id="personal" action={<span className="char-count">* Required</span>}>
        <div className="form-grid">
          <TextField id="pf-first" label="First name" required icon={User} autoComplete="given-name" error={errors.first_name?.message} {...register("first_name")} />
          <TextField id="pf-middle" label="Middle name" autoComplete="additional-name" error={errors.middle_name?.message} {...register("middle_name")} />
          <TextField id="pf-last" label="Last name" autoComplete="family-name" error={errors.last_name?.message} {...register("last_name")} />
          <TextField
            id="pf-preferred"
            label="Preferred name"
            placeholder="What should we call you?"
            autoComplete="nickname"
            error={errors.preferred_name?.message}
            {...register("preferred_name")}
          />
        </div>
      </SectionCard>

      <SectionCard id="contact">
        <div className="form-grid">
          <FieldShell
            id="pf-phone"
            label="Phone number"
            className="span-2"
            error={errors.phone_number?.message ?? errors.phone_country_code?.message}
          >
            <InputBox
              icon={Phone}
              error={errors.phone_number?.message ?? errors.phone_country_code?.message}
              leading={
                <span className="cc">
                  <select aria-label="Country calling code" {...register("phone_country_code")}>
                    <option value="">Code</option>
                    {DIAL_CODES.map((d) => (
                      <option key={d} value={`+${d}`}>
                        +{d}
                      </option>
                    ))}
                  </select>
                </span>
              }
            >
              <input
                id="pf-phone"
                type="tel"
                autoComplete="tel-national"
                placeholder="(415) 555-0142"
                aria-invalid={errors.phone_number ? true : undefined}
                {...register("phone_number")}
              />
            </InputBox>
          </FieldShell>
          <TextField id="pf-city" label="City" icon={Building2} autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
          <TextField
            id="pf-state"
            label="State / province"
            icon={MapPin}
            autoComplete="address-level1"
            error={errors.state_province?.message}
            {...register("state_province")}
          />
          <FieldShell id="pf-country" label="Country" className="span-2" error={errors.country_code?.message}>
            <InputBox icon={Globe} error={errors.country_code?.message}>
              <select id="pf-country" autoComplete="country" {...register("country_code")}>
                <option value="">Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
                {profile?.country_code && !COUNTRIES.some((c) => c.code === profile.country_code) ? (
                  <option value={profile.country_code}>{profile.country_code}</option>
                ) : null}
              </select>
            </InputBox>
          </FieldShell>
        </div>
      </SectionCard>

      <SectionCard id="professional">
        <div className="form-grid">
          <TextField
            id="pf-headline"
            label="Professional headline"
            icon={Briefcase}
            placeholder="Senior Product Designer"
            fieldClassName="span-2"
            maxLength={250}
            error={errors.professional_headline?.message}
            {...register("professional_headline")}
          />
          <FieldShell
            id="pf-summary"
            label="Professional summary"
            labelExtra={
              <small className="char-count">
                {summaryLength.toLocaleString()} / {SUMMARY_MAX.toLocaleString()}
              </small>
            }
            className="span-2"
            error={errors.professional_summary?.message}
          >
            <InputBox boxClassName="textarea" error={errors.professional_summary?.message}>
              <textarea
                id="pf-summary"
                maxLength={SUMMARY_MAX}
                placeholder="A few sentences about your experience, strengths and what you're looking for next."
                {...register("professional_summary")}
              />
            </InputBox>
          </FieldShell>
        </div>
      </SectionCard>

      <SectionCard id="links">
        <div className="form-grid">
          <TextField
            id="pf-linkedin"
            label="LinkedIn URL"
            icon={LinkedinIcon}
            type="url"
            placeholder="https://linkedin.com/in/your-name"
            error={errors.linkedin_url?.message}
            {...register("linkedin_url")}
          />
          <TextField
            id="pf-github"
            label="GitHub URL"
            icon={GithubIcon}
            type="url"
            placeholder="https://github.com/your-name"
            error={errors.github_url?.message}
            {...register("github_url")}
          />
        </div>
        <p className="hint" style={{ marginTop: 12 }}>
          <LinkIcon className="ic ic-xs" />
          Use full links starting with https://
        </p>
      </SectionCard>

      <div className="form-bar">
        <p>{isEdit ? (isDirty ? "You have unsaved changes" : "No changes yet") : "Only your first name is required to get started"}</p>
        <div className="actions">
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={mutation.isPending}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" size="sm" loading={mutation.isPending} arrow={<Save className="ic ic-sm" />}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
