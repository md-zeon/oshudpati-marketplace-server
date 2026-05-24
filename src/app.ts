import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { AuthRoutes } from "./modules/auth/auth.routes";
import errorHandler from "./middlewares/globalErrorHandler";
import { CategoryRoutes } from "./modules/category/category.routes";
import { MedicineRoutes } from "./modules/medicine/medicine.routes";
const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// Auth routes
app.use("/api/auth", AuthRoutes);
app.all("/api/auth/*splat", toNodeHandler(auth));

// Category routes
app.use("/api/categories", CategoryRoutes);

// Medicine routes
app.use("/api/medicines", MedicineRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Global error handler
app.use(errorHandler);

export default app;
