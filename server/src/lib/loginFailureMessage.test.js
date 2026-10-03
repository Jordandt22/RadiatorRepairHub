import test from "node:test";
import assert from "node:assert/strict";
import { loginFailureMessage } from "./loginFailureMessage.js";

test("unconfirmed email asks the owner to confirm before signing in", () => {
  assert.match(
    loginFailureMessage({
      code: "email_not_confirmed",
      message: "Email not confirmed",
    }),
    /Confirm your email before signing in/
  );
});

test("the confirmation message is used when only the Supabase text is present", () => {
  assert.match(
    loginFailureMessage({ message: "Email not confirmed" }),
    /Confirm your email before signing in/
  );
});

test("a wrong password stays a generic credential error", () => {
  assert.equal(
    loginFailureMessage({
      code: "invalid_credentials",
      message: "Invalid login credentials",
    }),
    "Invalid email or password."
  );
});

test("a missing error stays a generic credential error", () => {
  assert.equal(loginFailureMessage(null), "Invalid email or password.");
});
