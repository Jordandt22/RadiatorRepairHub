import { Router } from "express";
import { createContactInquiry } from "../controllers/contact-inquiries.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateContactInquirySchema } from "../schemas/contact-inquiries.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const contactInquiriesRouter = Router();

contactInquiriesRouter.post(
  "/",
  bodyValidator(CreateContactInquirySchema),
  serverErrorCatcherWrapper(createContactInquiry)
);

export default contactInquiriesRouter;
