import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  signInWithPassword,
  formatAuthSession,
  getClaimedBusinessByOwnerUid,
  updateAuthUserEmail,
  updateAuthUserPassword,
} from "../supabase/supabase.functions.js";
import { getWebBaseUrl } from "../lib/constants/messages.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR, ROUTE_NOT_FOUND, YUP_ERROR } =
  errorCodes;

export const loginOwner = async (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim() : "";
  const password = req.body.password;

  const { data: signInData, error: signInError } = await signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData?.session) {
    return res
      .status(401)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "Invalid email or password.",
          signInError
        )
      );
  }

  const session = formatAuthSession(signInData.session);
  if (!session) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Signed in, but no session was returned. Please try again."
        )
      );
  }

  const ownerUid = signInData.user?.id;
  const { data: business, error: businessError } =
    await getClaimedBusinessByOwnerUid(ownerUid);

  if (businessError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error finding your claimed business.",
          businessError
        )
      );
  }

  if (!business?.slug) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "No claimed business was found for this account."
        )
      );
  }

  return res.status(200).json(
    successHandler({
      slug: business.slug,
      session,
    })
  );
};

export const updateOwnerEmail = async (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const currentEmail =
    typeof req.user?.email === "string" ? req.user.email.trim().toLowerCase() : "";

  if (!email) {
    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, "Email is required."));
  }

  if (currentEmail && email === currentEmail) {
    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "Enter a different email than your current one."
        )
      );
  }

  const emailRedirectTo = `${getWebBaseUrl()}/email-confirmed`;
  const { data, error } = await updateAuthUserEmail(
    req.accessToken,
    email,
    emailRedirectTo
  );

  if (error) {
    const message =
      typeof error.message === "string" && error.message.trim()
        ? error.message
        : "Unable to update email. Please try again.";

    const status =
      error.status === 422 || error.code === "email_exists" ? 409 : 400;

    return res
      .status(status)
      .json(customErrorHandler(SUPABASE_ERROR, message, error));
  }

  return res.status(200).json(
    successHandler({
      email: data?.user?.email ?? currentEmail,
      newEmail: data?.user?.new_email ?? email,
      message:
        "Confirmation emails have been sent. Confirm the change from both your current and new inbox to finish updating your email.",
    })
  );
};

export const updateOwnerPassword = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const password = req.body.password;

  const { error } = await updateAuthUserPassword(req.accessToken, {
    password,
    currentPassword,
  });

  if (error) {
    const rawMessage =
      typeof error.message === "string" ? error.message.toLowerCase() : "";
    const isWrongPassword =
      error.status === 401 ||
      error.code === "invalid_credentials" ||
      rawMessage.includes("current password") ||
      rawMessage.includes("incorrect") ||
      rawMessage.includes("invalid login");

    const message = isWrongPassword
      ? "Current password is incorrect."
      : typeof error.message === "string" && error.message.trim()
        ? error.message
        : "Unable to update password. Please try again.";

    return res
      .status(isWrongPassword ? 401 : error.status === 422 ? 422 : 400)
      .json(
        customErrorHandler(
          isWrongPassword ? ACCESS_DENIED : SUPABASE_ERROR,
          message,
          error
        )
      );
  }

  return res.status(200).json(
    successHandler({
      message: "Your password has been updated.",
    })
  );
};
