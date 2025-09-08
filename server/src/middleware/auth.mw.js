import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { getAuthUserByAccessToken } from "../supabase/supabase.functions.js";

const { NO_ACCESS_TOKEN, USER_NOT_FOUND, INVALID_ACCESS_TOKEN, SERVER_ERROR } =
  errorCodes;

export const authUser = serverErrorCatcherWrapper(async (req, res, next) => {
  // SUPABASE AUTH
  const accessToken = req.headers?.authorization?.replace("Bearer ", "");
  if (!accessToken || accessToken === "null")
    return res
      .status(422)
      .json(customErrorHandler(NO_ACCESS_TOKEN, "MUST provide credentials."));

  // Check if the access token is valid
  const { data: userData, error: userError } = await getAuthUserByAccessToken(
    accessToken
  );
  if (userError) {
    if (userError.code === "bad_jwt" || userData?.user?.id !== req.params.id)
      return res
        .status(401)
        .json(
          customErrorHandler(INVALID_ACCESS_TOKEN, "Invalid access token.")
        );

    return res
      .status(500)
      .json(customErrorHandler(SERVER_ERROR, "Error verifying user."));
  }

  if (!userData)
    return res
      .status(404)
      .json(customErrorHandler(USER_NOT_FOUND, "User not found."));

  req.user = userData.user;
  return next();
});
