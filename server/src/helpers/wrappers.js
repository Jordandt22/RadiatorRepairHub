import { errorCodes, customErrorHandler } from "./customErrorHandler.js";
const { SERVER_ERROR } = errorCodes;

export const serverErrorCatcherWrapper = (controller) => {
  return async function (req, res, next) {
    try {
      return await controller.call(this, req, res, next);
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json(
          customErrorHandler(
            SERVER_ERROR,
            "Sorry, there was an error with the server."
          )
        );
    }
  };
};
