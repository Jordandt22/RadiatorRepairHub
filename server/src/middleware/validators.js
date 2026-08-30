import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";

const { YUP_ERROR } = errorCodes;

const validator = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: null };
  } catch (err) {
    const errors = {};
    for (const e of err.inner) {
      if (!errors[e.path]) {
        const pathList = e.path.split(".");
        errors[pathList[pathList.length - 1]] = e.message;
      }
    }
    return { valid: false, errors };
  }
};

export const bodyValidator = (schema) =>
  serverErrorCatcherWrapper(async (req, res, next) => {
    const { valid, errors } = await validator(schema, req.body);
    if (valid && !errors) {
      return next();
    }

    res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  });

/** Pick schema from the request (e.g. authenticated vs anonymous claim). */
export const bodyValidatorFor = (getSchema) =>
  serverErrorCatcherWrapper(async (req, res, next) => {
    const schema = getSchema(req);
    const { valid, errors } = await validator(schema, req.body);
    if (valid && !errors) {
      return next();
    }

    res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  });

export const paramsValidator = (schema) =>
  serverErrorCatcherWrapper(async (req, res, next) => {
    const { valid, errors } = await validator(schema, req.params);
    if (valid && !errors) {
      return next();
    }

    res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  });

const flattenQuery = (query = {}) => {
  const next = {};
  for (const [key, value] of Object.entries(query)) {
    next[key] = Array.isArray(value) ? value[0] : value;
  }
  return next;
};

export const queryValidator = (schema) =>
  serverErrorCatcherWrapper(async (req, res, next) => {
    const query = flattenQuery(req.query);
    const { valid, errors } = await validator(schema, query);
    if (valid && !errors) {
      try {
        Object.assign(req.query, query);
      } catch {
        // Express 5 query objects can be read-only
      }
      return next();
    }

    res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  });
