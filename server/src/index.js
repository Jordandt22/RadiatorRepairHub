import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import http from "http";
import { logger } from "./lib/logger.js";
import { arcjetMiddleware } from "./middleware/arcjet.mw.js";

// Routes
import businessesRouter from "./routes/businesses.routes.js";
import locationRouter from "./routes/location.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import contactMessagesRouter from "./routes/contact-messages.routes.js";
import contactInquiriesRouter from "./routes/contact-inquiries.routes.js";
import listingRequestsRouter from "./routes/listing-requests.routes.js";
import listingReportsRouter from "./routes/listing-reports.routes.js";
import feedbackSurveysRouter from "./routes/feedback-surveys.routes.js";
import affiliateProductsRouter from "./routes/affiliate-products.routes.js";
import adminRouter from "./routes/admin/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import billingRouter from "./routes/billing.routes.js";
import businessStatsRouter from "./routes/business-stats.routes.js";
import searchStatsRouter from "./routes/search-stats.routes.js";
import stripeWebhookRouter from "./routes/stripeWebhook.routes.js";
import emailUnsubscribeRouter from "./routes/email-unsubscribe.routes.js";

const app = express();

// Middleware
const { NODE_ENV, API_VERSION, PORT, WEB_URL, INTERNAL_CLIENT_URL } = process.env;
const notProduction = NODE_ENV !== "production";
app.use(helmet());
app.use(
  cors({
    origin: notProduction
      ? ["http://localhost:3000", "http://localhost:3001"]
      : [WEB_URL, INTERNAL_CLIENT_URL],
  })
);
// Stripe webhooks need the raw body — mount before JSON parsing and Arcjet.
app.use(
  "/webhooks",
  express.raw({ type: "application/json" }),
  stripeWebhookRouter
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/" || req.url === "/health",
    },
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);
if (!notProduction) {
  app.enable("trust proxy");
  app.set("trust proxy", 1);
}

// Landing Page Route
app.get("/", (req, res) => {
  res.send("RadiatorRepairHub API Server is Up and Running !");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Arcjet Middleware
app.use(arcjetMiddleware);

// ---- API Routes ----

// Routes for Businesses
app.use(`/v${API_VERSION}/api/businesses`, businessesRouter);

// Routes for Location
app.use(`/v${API_VERSION}/api/location`, locationRouter);

// Routes for Categories
app.use(`/v${API_VERSION}/api/categories`, categoriesRouter);

// Routes for Contact Messages
app.use(`/v${API_VERSION}/api/contact-messages`, contactMessagesRouter);

// Routes for Contact Inquiries (site contact form)
app.use(`/v${API_VERSION}/api/contact-inquiries`, contactInquiriesRouter);

// Routes for Listing Requests (get listed)
app.use(`/v${API_VERSION}/api/listing-requests`, listingRequestsRouter);

// Routes for Listing Reports
app.use(`/v${API_VERSION}/api/listing-reports`, listingReportsRouter);

// Routes for post-submit feedback surveys
app.use(`/v${API_VERSION}/api/feedback-surveys`, feedbackSurveysRouter);

// Routes for public affiliate products (active only)
app.use(`/v${API_VERSION}/api/affiliate-products`, affiliateProductsRouter);

// Routes for Admin
app.use(`/v${API_VERSION}/api/admin`, adminRouter);

// Routes for Owner Auth
app.use(`/v${API_VERSION}/api/auth`, authRouter);

// Routes for Stripe billing (Featured listings)
app.use(`/v${API_VERSION}/api/billing`, billingRouter);

// Routes for public listing stats ingest
app.use(`/v${API_VERSION}/api/business-stats`, businessStatsRouter);

// Routes for public search demand stats ingest
app.use(`/v${API_VERSION}/api/search-stats`, searchStatsRouter);

app.use(`/v${API_VERSION}/api/email`, emailUnsubscribeRouter);

// PORT and Sever
const server = http.createServer(app);
server.listen(PORT || 8000, () => {
  logger.info(`CORS Enabled Server, Listening to port: ${PORT || 8000}...`);
});

export default server;
