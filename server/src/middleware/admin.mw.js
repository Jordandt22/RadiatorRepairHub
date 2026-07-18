import { jwtVerify } from "jose";
import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";

const { ACCESS_DENIED } = errorCodes;

export const authAdmin = serverErrorCatcherWrapper(async (req, res, next) => {
  const header = req.headers?.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "Missing or invalid Authorization header."
        )
      );
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res
      .status(401)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "Missing or invalid Authorization header."
        )
      );
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.admin = payload;
    return next();
  } catch {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Invalid or expired token."));
  }
});
