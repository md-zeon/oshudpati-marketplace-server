import { Router } from "express";
import { orderController } from "./order.controller";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { OrderValidation } from "./order.validation";

const router: Router = Router();

// create a new order
router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(OrderValidation.createOrderZodSchema),
  orderController.createOrder,
);

export const orderRoutes: Router = router;
