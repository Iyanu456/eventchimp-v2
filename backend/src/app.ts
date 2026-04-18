import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { corsOptions } from "./config/cors";
import { swaggerSpec } from "./config/swagger";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { brandingRouter } from "./routes/branding.routes";
import { checkoutRouter } from "./routes/checkout.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { eventRouter } from "./routes/event.routes";
import { ticketRouter } from "./routes/ticket.routes";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";

export const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "EventChimp API is healthy"
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/branding", brandingRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
