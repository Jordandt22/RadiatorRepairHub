import * as Yup from "yup";
import { getPasswordStrengthError } from "../lib/password.js";

const strongPasswordTest = {
  name: "password-strength",
  test(value) {
    const message = getPasswordStrengthError(value ?? "");
    if (!message) return true;
    return this.createError({ message });
  },
};

export const OwnerLoginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  // Login: length only — existing accounts may predate stronger rules.
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export const UpdateOwnerEmailSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export const ForgotPasswordSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export const UpdateOwnerPasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  password: Yup.string()
    .required("New password is required")
    .test(strongPasswordTest)
    .test(
      "different-from-current",
      "New password must be different from your current password",
      function (value) {
        const { currentPassword } = this.parent;
        if (!value || !currentPassword) return true;
        return value !== currentPassword;
      }
    ),
  confirmPassword: Yup.string()
    .required("Confirm your new password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});
