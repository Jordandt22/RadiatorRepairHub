import { Router } from "express";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import {
  unsubscribeEmailGet,
  unsubscribeEmailPost,
} from "../controllers/email-unsubscribe.controller.js";

const emailUnsubscribeRouter = Router();

emailUnsubscribeRouter.get(
  "/unsubscribe",
  serverErrorCatcherWrapper(unsubscribeEmailGet)
);

emailUnsubscribeRouter.post(
  "/unsubscribe",
  serverErrorCatcherWrapper(unsubscribeEmailPost)
);

export default emailUnsubscribeRouter;
