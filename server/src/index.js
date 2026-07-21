import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { arcjetMiddleware } from "./middleware/arcjet.mw.js";

// Routes
import businessesRouter from "./routes/businesses.routes.js";
import locationRouter from "./routes/location.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import contactMessagesRouter from "./routes/contact-messages.routes.js";
import adminRouter from "./routes/admin/admin.routes.js";

const app = express();

// Middleware
const { NODE_ENV, API_VERSION, PORT, WEB_URL } = process.env;
const notProduction = NODE_ENV !== "production";
app.use(helmet());
app.use(
  cors({
    origin: notProduction
      ? ["http://localhost:3000", "http://localhost:3001"]
      : WEB_URL,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
if (notProduction) {
  app.use(morgan("dev"));
} else {
  app.enable("trust proxy");
  app.set("trust proxy", 1);
}

// Landing Page Route
app.get("/", (req, res) => {
  res.send("RadiatorRepairHub API Server is Up and Running !");
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

// Routes for Admin
app.use(`/v${API_VERSION}/api/admin`, adminRouter);

// PORT and Sever
const server = http.createServer(app);
server.listen(PORT || 8000, () => {
  console.log(`CORS Enabled Server, Listening to port: ${PORT || 8000}...`);
});

export default server;
