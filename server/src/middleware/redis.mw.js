import { getCacheData } from "../redis/redis.js";
import {
  customErrorHandler,
  successHandler,
  errorCodes,
} from "../helpers/customErrorHandler.js";

const { SERVER_ERROR } = errorCodes;

export const checkCache =
  (getCacheKeyFunc, paramKey) => async (req, res, next) => {
    try {
      const { key } = getCacheKeyFunc(paramKey ? req.params[paramKey] : "");
      const cachedData = await getCacheData(key);
      if (cachedData) {
        return res.status(200).json(successHandler(cachedData.data));
      }
      next();
    } catch (error) {
      res
        .status(500)
        .json(customErrorHandler(SERVER_ERROR, "Error checking cache."));
    }
  };
