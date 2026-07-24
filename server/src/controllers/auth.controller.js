import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  signInWithPassword,
  formatAuthSession,
  getClaimedBusinessByEmail,
} from "../supabase/supabase.functions.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR, ROUTE_NOT_FOUND } =
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

  const userEmail =
    typeof signInData.user?.email === "string"
      ? signInData.user.email.trim()
      : email;

  const { data: business, error: businessError } =
    await getClaimedBusinessByEmail(userEmail);

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
