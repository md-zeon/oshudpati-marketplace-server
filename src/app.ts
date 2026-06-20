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
import { CartRoutes } from "./modules/cart/cart.routes";
import { AddressRoutes } from "./modules/address/address.routes";
import { notFoundHandler } from "./middlewares/notFound";
import { ReviewRoutes } from "./modules/review/review.routes";
import { WishlistRoutes } from "./modules/wishlist/wishlist.routes";
import { DashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { ShopRoutes } from "./modules/shop/shop.routes";
const app: Application = express();

// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/oshudpati-marketplace-client.*\.vercel\.app$/.test(
          origin,
        ) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// app.use(
//   cors({
//     origin: process.env.APP_URL || "http://localhost:3000",
//     credentials: true,
//   }),
// );

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

// Cart routes
app.use("/api/cart", CartRoutes);

// Address routes
app.use("/api/addresses", AddressRoutes);

// Review routes
app.use("/api/reviews", ReviewRoutes);

// Wishlist routes
app.use("/api/wishlist", WishlistRoutes);

// Shop routes
app.use("/api/shops", ShopRoutes);

// Dashboard routes
app.use("/api/dashboard", DashboardRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Oshudpati Marketplace API is running!");
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
