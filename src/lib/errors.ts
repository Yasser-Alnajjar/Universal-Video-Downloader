const FALLBACK_MESSAGE =
  "Something went wrong. Please check the URL and try again.";

const KNOWN_MESSAGES: Record<string, string> = {
  INVALID_URL: "Please enter a valid URL.",
  UNSUPPORTED_PLATFORM: "This URL isn't from a supported platform.",
};

/** Rejects messages that look like they leaked internals (stack frames, file paths). */
function isSafeMessage(message: string): boolean {
  if (!message || message.length > 200) return false;
  if (/at \S+ \(.*:\d+:\d+\)/.test(message)) return false;
  if (/\/(Users|home|var|node_modules|src)\//.test(message)) return false;
  if (/^(Error|TypeError|RangeError):/.test(message)) return false;
  return true;
}

/** Never forward raw backend errors to the client — map to a safe, user-facing message. */
export function getUserErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (KNOWN_MESSAGES[error.message]) return KNOWN_MESSAGES[error.message];
    if (isSafeMessage(error.message)) return error.message;
  }
  return FALLBACK_MESSAGE;
}
