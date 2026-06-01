import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { CartController } from "./cart.controller";
import { CartValidation } from "./cart.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = Router();

// add item to cart
router.post(
  "/",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.addToCartZodSchema),
  CartController.addToCart,
);

// get my cart
router.get(
  "/",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  CartController.getMyCart,
);

// get cart summary
router.get(
  "/summary",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  CartController.getCartSummary,
);

// merge guest cart with user cart
router.post(
  "/merge",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.mergeGuestCartZodSchema),
  CartController.mergeGuestCart,
);

// update cart item quantity
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.updateCartItemQuantityZodSchema),
  CartController.updateCartItemQuantity,
);

// remove cart item
router.delete(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  validateRequest(CartValidation.removeCartItemZodSchema),
  CartController.removeCartItem,
);

// clear cart
router.delete(
  "/",
  auth(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  CartController.clearCart,
);

export const CartRoutes = router;
