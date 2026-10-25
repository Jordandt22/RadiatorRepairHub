import { Router } from "express";
import { createTemplateLead } from "../controllers/template-leads.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateTemplateLeadSchema } from "../schemas/template-leads.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const templateLeadsRouter = Router();

templateLeadsRouter.post(
  "/",
  bodyValidator(CreateTemplateLeadSchema),
  serverErrorCatcherWrapper(createTemplateLead)
);

export default templateLeadsRouter;
