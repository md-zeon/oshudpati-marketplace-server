import { Router } from "express";
import { UserController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";

const router: Router = Router();

// Get all users (Admin only)
router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);

// update user account status [BAN, ACTIVE] (Admin only)
router.patch(
  "/:id/account-status",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserAccountStatusZodSchema),
  UserController.updateUserAccountStatus,
);

export const UserRoutes = router;
