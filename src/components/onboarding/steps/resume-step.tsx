"use client";

import { Check, CircleCheck, CloudUpload, FileText, Globe, Link as LinkIcon, Sparkles, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { TextField } from "@/components/forms/field";
import { LinkedinIcon } from "@/components/icons/brand";
import { Notice } from "@/components/ui/notice";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useSetupList, useSkills } from "@/hooks/use-profile-setup";
import { ApiError } from "@/lib/api/errors";
import { linkSchema, profileFormSchema } from "@/lib/profile/schema";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { useStepNav } from "../use-step-nav";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = [".pdf", ".doc", ".docx"];

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function withScheme(v: string) {
  const t = v.trim();
  return t && !/^https?:\/\//i.test(t) ? `https://${t}` : t;
}

/** Step 5 — portfolio, LinkedIn and GitHub links are saved to the profile; the resume file stays local. */
export function ResumeStep() {
  const nav = useStepNav(4);
  const profile = useProfile();
  const skills = useSkills();
  const experience = useSetupList("experience");
  const education = useSetupList("education");
  const certifications = useSetupList("certifications");
  const update = useUpdateProfile();
  const { draft, update: updateDraft } = useOnboardingStore();
  const [linkedinInput, setLinkedin] = useState<string | null>(null);
  const [githubInput, setGithub] = useState<string | null>(null);
  const linkedin = linkedinInput ?? profile.data?.linkedin_url ?? "";
  const github = githubInput ?? profile.data?.github_url ?? "";
  const [portfolioInput, setPortfolio] = useState<string | null>(null);
  const portfolio = portfolioInput ?? profile.data?.portfolio_url ?? "";
  const [fileError, setFileError] = useState<string | null>(null);
  const [linkErrors, setLinkErrors] = useState<{ portfolio?: string; linkedin?: string; github?: string }>({});
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPT.includes(ext)) return setFileError("Upload a PDF, DOC or DOCX file");
    if (file.size > MAX_BYTES) return setFileError("Files must be 5 MB or smaller");
    setFileError(null);
    updateDraft({ resumeFile: { name: file.name, size: file.size } });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const persist = async (): Promise<boolean> => {
    const pf = withScheme(portfolio);
    const li = withScheme(linkedin);
    const gh = withScheme(github);
    const errs = {
      portfolio: linkSchema.safeParse(pf).error?.issues[0]?.message,
      linkedin: profileFormSchema.shape.linkedin_url.safeParse(li).error?.issues[0]?.message,
      github: profileFormSchema.shape.github_url.safeParse(gh).error?.issues[0]?.message,
    };
    setLinkErrors(errs);
    if (errs.portfolio || errs.linkedin || errs.github) return false;
    const current = profile.data;
    if (!current) return true;
    const patch: Record<string, string | null> = {};
    if (portfolioInput !== null && (pf || null) !== current.portfolio_url) patch.portfolio_url = pf || null;
    if (linkedinInput !== null && (li || null) !== current.linkedin_url) patch.linkedin_url = li || null;
    if (githubInput !== null && (gh || null) !== current.github_url) patch.github_url = gh || null;
    if (!Object.keys(patch).length) return true;
    try {
      await update.mutateAsync(patch);
      setPortfolio(null);
      setLinkedin(null);
      setGithub(null);
      return true;
    } catch {
      return false;
    }
  };
  const count = (rows: unknown[] | undefined) => rows?.length ?? 0;

  const apiError = update.error instanceof ApiError ? update.error : null;

  return (
    <OnboardingShell
      stepIndex={4}
      title={
        <>
          Resume &amp; <span className="hl">portfolio</span>
        </>
      }
      description="Upload your resume and share your work. We'll fill in anything we find."
      onSaveExit={() => void nav.exit(persist)}
      footer={<OnboardingFooter stepIndex={4} skip onSkip={nav.skip} onContinue={() => void nav.next(persist)} loading={nav.busy} />}
    >
      {apiError ? <Notice tone="err">{apiError.message}</Notice> : null}
      {!profile.isPending && !profile.data ? (
        <Notice tone="info">Complete Basic Info first so we can save your links to your profile.</Notice>
      ) : null}
      <div className="grid-2 g-top">
        <div>
          <div className="ob-label">Resume</div>
          <div
            className={`drop ${drag ? "drag" : ""}`}
            onDragOver={(e) => (e.preventDefault(), setDrag(true))}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <span className="drop-ic">
              <CloudUpload className="ic ic-lg" />
            </span>
            <b>Drag &amp; drop your resume here</b>
            <small>
              or{" "}
              <button type="button" className="link-btn" style={{ color: "var(--primary)", fontWeight: 700 }} onClick={() => fileRef.current?.click()}>
                browse files
              </button>{" "}
              · PDF, DOC, DOCX up to 5 MB
            </small>
            <input
              ref={fileRef}
              className="file-input"
              type="file"
              accept={ACCEPT.join(",")}
              onChange={(e) => (pickFile(e.target.files?.[0]), (e.target.value = ""))}
            />
          </div>
          {fileError ? <div className="field-err">{fileError}</div> : null}
          {draft.resumeFile ? (
            <div className="file-row">
              <span className="file-ic">
                <FileText className="ic ic-sm" />
              </span>
              <div className="file-main">
                <b>{draft.resumeFile.name}</b>
                <small>{formatSize(draft.resumeFile.size)} · Added just now</small>
                <div className="progress">
                  <i style={{ width: "100%" }}></i>
                </div>
              </div>
              <span className="pill">
                <Check className="ic" /> Ready
              </span>
              <button type="button" className="exp-act" aria-label="Remove resume" onClick={() => updateDraft({ resumeFile: null })}>
                <X className="ic ic-sm" />
              </button>
            </div>
          ) : null}
          <div className="divider" style={{ margin: "16px 0" }}>
            or
          </div>
          <button type="button" className="btn btn-ghost btn-block btn-sm" disabled title="Coming soon">
            <Sparkles className="ic ic-sm" />
            Build a resume with AI
          </button>
        </div>
        <div>
          <div className="ob-label">What JobAI extracted</div>
          <div className="mini-stats">
            <div className="mini-stat">
              <b>{count(skills.data)}</b>
              <small>Skills</small>
            </div>
            <div className="mini-stat">
              <b>{count(experience.data)}</b>
              <small>Roles</small>
            </div>
            <div className="mini-stat">
              <b>{count(education.data)}</b>
              <small>Degree</small>
            </div>
            <div className="mini-stat">
              <b>{count(certifications.data)}</b>
              <small>Certificates</small>
            </div>
          </div>
          <div className="ob-label" style={{ marginTop: 20 }}>
            Portfolio &amp; links
          </div>
          <TextField
            id="res-portfolio"
            label="Portfolio website"
            icon={Globe}
            placeholder="yourname.design"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            error={linkErrors.portfolio ?? apiError?.fieldErrors.portfolio_url}
            state={portfolio && !linkErrors.portfolio ? "ok" : ""}
            trailing={portfolio && !linkErrors.portfolio ? <CircleCheck className="ic ic-sm state" /> : null}
          />
          <TextField
            id="res-linkedin"
            label="LinkedIn"
            icon={LinkedinIcon}
            placeholder="linkedin.com/in/your-name"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            error={linkErrors.linkedin ?? apiError?.fieldErrors.linkedin_url}
          />
          <TextField
            id="res-github"
            label="GitHub / Dribbble"
            icon={LinkIcon}
            placeholder="Add a link (optional)"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            error={linkErrors.github ?? apiError?.fieldErrors.github_url}
          />
        </div>
      </div>
    </OnboardingShell>
  );
}
