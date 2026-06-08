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

// get my orders (customer)
router.get("/my-orders", auth(UserRole.CUSTOMER), orderController.getMyOrders);

// get seller orders
router.get(
  "/seller-orders",
  auth(UserRole.SELLER),
  orderController.getSellerOrders,
);

// get all orders (admin)
router.get("/all-orders", auth(UserRole.ADMIN), orderController.getAllOrders);

// get order details (for customer and seller)
router.get(
  "/:orderId",
  auth(UserRole.CUSTOMER, UserRole.SELLER),
  validateRequest(OrderValidation.getOrderByIdZodSchema),
  orderController.getOrderById,
);

router.get(
  "/order-number/:orderNumber",
  auth(UserRole.CUSTOMER, UserRole.SELLER),
  orderController.getOrderByOrderNumber,
);

// cancel a vendor order (for customer)
router.patch(
  "/vendor-order/:vendorOrderId/cancel",
  auth(UserRole.CUSTOMER),
  orderController.cancelVendorOrder,
);

// update order status (for seller)
router.patch(
  "/:orderId/status",
  auth(UserRole.SELLER),
  validateRequest(OrderValidation.updateOrderStatusZodSchema),
  orderController.updateOrderStatus,
);

export const orderRoutes: Router = router;
