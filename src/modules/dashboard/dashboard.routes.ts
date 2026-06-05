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

// Get seller dashboard data
router.get(
  "/seller",
  auth(UserRole.SELLER),
  DashboardController.getSellerDashboard,
);

// Get admin dashboard data
router.get(
  "/admin",
  auth(UserRole.ADMIN),
  DashboardController.getAdminDashboard,
);

export const DashboardRoutes = router;
