import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = Router();

// Get customer dashboard data
router.get(
  "/customer",
  auth(UserRole.CUSTOMER),
  DashboardController.getCustomerDashboard,
);

export const DashboardRoutes = router;
