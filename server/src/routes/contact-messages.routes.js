import { Router } from "express";
import { createContactMessage } from "../controllers/contact-messages.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateContactMessageSchema } from "../schemas/contact-messages.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const contactMessagesRouter = Router();

contactMessagesRouter.post(
  "/",
  bodyValidator(CreateContactMessageSchema),
  serverErrorCatcherWrapper(createContactMessage)
);

export default contactMessagesRouter;
