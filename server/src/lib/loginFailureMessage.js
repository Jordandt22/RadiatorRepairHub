const EMAIL_CONFIRMATION_REQUIRED =
  "Confirm your email before signing in. Check your inbox for the confirmation link we sent when you claimed the listing.";

const INVALID_CREDENTIALS = "Invalid email or password.";

export function loginFailureMessage(signInError) {
  const code = typeof signInError?.code === "string" ? signInError.code : "";
  const rawMessage =
    typeof signInError?.message === "string"
      ? signInError.message.trim().toLowerCase()
      : "";

  if (code === "email_not_confirmed" || rawMessage === "email not confirmed") {
    return EMAIL_CONFIRMATION_REQUIRED;
  }

  return INVALID_CREDENTIALS;
}
