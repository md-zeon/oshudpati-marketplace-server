import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { AuthRoutes } from "./modules/auth/auth.routes";
import errorHandler from "./middlewares/globalErrorHandler";
import { CategoryRoutes } from "./modules/category/category.routes";
import { MedicineRoutes } from "./modules/medicine/medicine.routes";
import { UserRoutes } from "./modules/user/user.routes";
import { orderRoutes } from "./modules/order/order.routes";
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

// User routes
app.use("/api/users", UserRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Oshudpati Marketplace API is running!");
});

// Global error handler
app.use(errorHandler);

export default app;
