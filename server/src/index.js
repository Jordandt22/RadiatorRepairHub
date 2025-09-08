import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { arcjetMiddleware } from "./middleware/arcjet.mw.js";

// Routes
import businessesRouter from "./routes/businesses.routes.js";

const app = express();

// Middleware
const { NODE_ENV } = process.env;
const notProduction = NODE_ENV !== "production";
app.use(helmet());
app.use(cors());
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
  res.send("BranchBound API Server is Up and Running !");
});

// Arcjet Middleware
app.use(arcjetMiddleware);

// ---- API Routes ----

// Routes for Businesses
app.use(`/v${process.env.API_VERSION}/api/businesses`, businessesRouter);

// PORT and Sever
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`CORS Enabled Server, Listening to port: ${PORT}...`);
});

export default server;
