import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { CartController } from "./cart.controller";
import { CartValidation } from "./cart.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = Router();

// add item to cart
router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(CartValidation.addToCartZodSchema),
  CartController.addToCart,
);

// get my cart
router.get("/", auth(UserRole.CUSTOMER), CartController.getMyCart);

// update cart item quantity
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(CartValidation.updateCartItemQuantityZodSchema),
  CartController.updateCartItemQuantity,
);

// remove cart item
router.delete(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(CartValidation.removeCartItemZodSchema),
  CartController.removeCartItem,
);

// clear cart
router.delete("/", auth(UserRole.CUSTOMER), CartController.clearCart);

export const CartRoutes = router;
