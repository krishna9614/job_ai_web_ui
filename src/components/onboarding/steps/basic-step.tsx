"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Camera, CircleCheck, Clock, Lock, Mail, MapPin, Sparkles, Upload, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FieldShell, InputBox, SelectField, TextField } from "@/components/forms/field";
import { Notice } from "@/components/ui/notice";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCreateProfile, useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { ApiError } from "@/lib/api/errors";
import { DIAL_CODES } from "@/lib/profile/countries";
import { formatLocation, initials } from "@/lib/profile/format";
import { parseLocation, splitFullName } from "@/lib/profile/location";
import {
  profileFormSchema,
  profileToForm,
  toCreatePayload,
  toUpdatePayload,
  type ProfileFormValues,
} from "@/lib/profile/schema";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { stepHref } from "../steps";

const EXPERIENCE = ["Less than 1 year", "1–2 years", "3–5 years", "6–8 years", "9–12 years", "13+ years"] as const;

const basicSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(300, "Name is too long"),
  headline: profileFormSchema.shape.professional_headline,
  dial: profileFormSchema.shape.phone_country_code,
  phone: profileFormSchema.shape.phone_number,
  location: z.string().trim().max(300, "Location is too long"),
  totalExperience: z.string(),
});
type BasicValues = z.infer<typeof basicSchema>;

/** Step 1 — persisted to the profile API (POST when new, PATCH when it already exists). */
export function BasicStep() {
  const router = useRouter();
  const user = useCurrentUser();
  const profile = useProfile();
  const create = useCreateProfile();
  const update = useUpdateProfile();
  const { draft, update: updateDraft } = useOnboardingStore();
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BasicValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: { fullName: "", headline: "", dial: "+1", phone: "", location: "", totalExperience: "" },
  });

  useEffect(() => {
    if (profile.isPending || isDirty) return;
    const p = profile.data;
    reset({
      fullName: p ? [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ") : draft.fullNameHint,
      headline: p?.professional_headline ?? "",
      dial: p?.phone_country_code ?? "+1",
      phone: p?.phone_number ?? "",
      location: p ? (formatLocation(p) ?? "") : "",
      totalExperience: draft.totalExperience,
    });
  }, [profile.isPending, profile.data, draft.fullNameHint, draft.totalExperience, isDirty, reset]);

  useEffect(() => () => void (photo && URL.revokeObjectURL(photo)), [photo]);

  const onSubmit = handleSubmit((values) => {
    updateDraft({ totalExperience: values.totalExperience });
    const loc = parseLocation(values.location);
    const current = profile.data;
    const next: ProfileFormValues = {
      ...profileToForm(current),
      ...splitFullName(values.fullName),
      professional_headline: values.headline,
      phone_country_code: values.phone ? values.dial : "",
      phone_number: values.phone,
      city: loc.city,
      state_province: loc.state_province,
      country_code: loc.country_code,
    };
    const go = () => router.push(stepHref(1));
    if (current) {
      const patch = toUpdatePayload(next, current);
      if (Object.keys(patch).length === 0) return go();
      update.mutate(patch, { onSuccess: go });
    } else {
      create.mutate(toCreatePayload(next), { onSuccess: go });
    }
  });

  const mutationError = (create.error ?? update.error) as ApiError | null;
  const loadError = profile.error instanceof ApiError ? profile.error : null;

  return (
    <form onSubmit={onSubmit} noValidate>
      <OnboardingShell
        stepIndex={0}
        title={
          <>
            Let&apos;s set up <span className="hl">your profile</span>
          </>
        }
        description="This helps us find the best job opportunities for you."
        footer={<OnboardingFooter stepIndex={0} loading={create.isPending || update.isPending} />}
      >
        {loadError ? <Notice tone="err">{loadError.message}</Notice> : null}
        {mutationError ? <Notice tone="err">{mutationError.message}</Notice> : null}
        <div className="photo-up">
          <div
            className="avatar-lg"
            style={photo ? { backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {photo ? null : initials(profile.data, user.data)}
            <span className="cam">
              <Camera className="ic ic-sm" />
            </span>
          </div>
          <div className="photo-meta">
            <b>Profile photo</b>
            <small>Profiles with a photo get 2.3× more recruiter views</small>
            <div className="photo-btns">
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="ic ic-sm" />
                Upload new
              </button>
              {photo ? (
                <button type="button" className="link-muted link-btn" onClick={() => setPhoto(null)}>
                  Remove
                </button>
              ) : null}
              <input
                ref={fileRef}
                className="file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(URL.createObjectURL(file));
                  e.target.value = "";
                }}
              />
            </div>
          </div>
          <div className="ai-tip ai-tip-side">
            <span className="tip-ic">
              <Sparkles className="ic ic-sm" />
            </span>
            <span>
              We pre-filled these details from <b>your JobAI account</b>. Just review and confirm.
            </span>
          </div>
        </div>
        <div className="grid-2">
          <TextField
            id="ob-name"
            label="Full name"
            required
            icon={User}
            autoComplete="name"
            placeholder="Jessica Morgan"
            error={errors.fullName?.message ?? mutationError?.fieldErrors.first_name}
            {...register("fullName")}
          />
          <TextField
            id="ob-headline"
            label="Professional headline"
            icon={Briefcase}
            placeholder="Senior Product Designer"
            error={errors.headline?.message ?? mutationError?.fieldErrors.professional_headline}
            {...register("headline")}
          />
          <TextField
            id="ob-email"
            label="Email address"
            labelExtra={
              user.data?.email_verified_at ? (
                <span className="verified">
                  <CircleCheck className="ic ic-xs" />
                  Verified
                </span>
              ) : null
            }
            icon={Mail}
            state="locked"
            value={user.data?.email ?? ""}
            trailing={<Lock className="ic ic-sm state" />}
            readOnly
          />
          <FieldShell
            id="ob-phone"
            label="Phone number"
            error={errors.phone?.message ?? errors.dial?.message ?? mutationError?.fieldErrors.phone_number}
          >
            <InputBox
              error={errors.phone?.message}
              leading={
                <span className="cc">
                  <select aria-label="Country calling code" {...register("dial")}>
                    {DIAL_CODES.map((d) => (
                      <option key={d} value={`+${d}`}>
                        +{d}
                      </option>
                    ))}
                  </select>
                </span>
              }
            >
              <input id="ob-phone" type="tel" autoComplete="tel-national" placeholder="(415) 555-0142" {...register("phone")} />
            </InputBox>
          </FieldShell>
          <TextField
            id="ob-location"
            label="Location"
            icon={MapPin}
            placeholder="City, State, Country"
            error={errors.location?.message ?? mutationError?.fieldErrors.city ?? mutationError?.fieldErrors.country_code}
            {...register("location")}
          />
          <SelectField
            id="ob-experience"
            label="Total experience"
            icon={Clock}
            options={EXPERIENCE}
            placeholder="Select"
            {...register("totalExperience")}
          />
        </div>
      </OnboardingShell>
    </form>
  );
}
