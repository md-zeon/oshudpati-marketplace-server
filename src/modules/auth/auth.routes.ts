import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = Router();

router.get(
  "/me",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  AuthController.getCurrentUser,
);

export const AuthRoutes: Router = router;
