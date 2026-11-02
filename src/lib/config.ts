/** Support contact used by every "Contact support" link. */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@jobai.com";
export const SUPPORT_HREF = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("JobAI support request")}`;
