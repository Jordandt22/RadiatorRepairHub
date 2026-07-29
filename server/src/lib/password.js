/** Supabase-aligned password strength: 8+, lower, upper, digit, symbol. */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS_HINT =
  "At least 8 characters, with uppercase, lowercase, a number, and a symbol.";

const SYMBOL_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~\\]/;

export function getPasswordStrengthError(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return "Password must be at least 8 characters.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }
  if (!SYMBOL_PATTERN.test(password)) {
    return "Password must include a symbol (!@#$%^&* etc.).";
  }
  return null;
}

export function isStrongPassword(password) {
  return getPasswordStrengthError(password) === null;
}
