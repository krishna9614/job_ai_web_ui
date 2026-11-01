import { AxiosError, isAxiosError } from "axios";
import type { ApiErrorBody, ValidationIssue } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, code: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "The request could not be processed.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have access to this resource.",
  404: "We couldn't find what you were looking for.",
  409: "This already exists.",
  422: "Some fields need your attention.",
  429: "Too many attempts. Please wait a moment and try again.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

function fromValidationIssues(issues: ValidationIssue[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.loc.filter((part) => part !== "body").at(-1);
    const msg = issue.msg.replace(/^Value error, /, "");
    if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = msg;
  }
  const first = issues[0]?.msg.replace(/^Value error, /, "");
  return { fieldErrors, message: first ?? FALLBACK_MESSAGES[422] };
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) return fromAxiosError(error);
  return new ApiError(error instanceof Error ? error.message : "Something went wrong.", 0, "unknown");
}

function fromAxiosError(error: AxiosError<ApiErrorBody>): ApiError {
  if (!error.response) {
    return new ApiError("We couldn't reach JobAI. Check your connection and try again.", 0, "network_error");
  }
  const { status, data } = error.response;
  const code = data?.code ?? (status === 422 ? "validation_error" : `http_${status}`);
  if (Array.isArray(data?.detail)) {
    const { message, fieldErrors } = fromValidationIssues(data.detail);
    return new ApiError(message, status, code, fieldErrors);
  }
  const message =
    typeof data?.detail === "string" && data.detail
      ? data.detail
      : (FALLBACK_MESSAGES[status] ?? "Something went wrong. Please try again.");
  return new ApiError(message, status, code);
}
