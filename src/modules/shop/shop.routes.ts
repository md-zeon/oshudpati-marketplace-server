import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { ShopController } from "./shop.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { ShopValidation } from "./shop.validation";

const router: Router = Router();

// Get my shop (seller)
router.get("/my-shop", auth(UserRole.SELLER), ShopController.getMyShop);

// Get shop by slug (public)
router.get(
  "/:slug",
  validateRequest(ShopValidation.getShopBySlugZodSchema),
  ShopController.getShopBySlug,
);

// Create shop (seller)
router.post(
  "/",
  auth(UserRole.SELLER),
  validateRequest(ShopValidation.createShopZodSchema),
  ShopController.createShop,
);

// Update shop (seller)
router.patch(
  "/",
  auth(UserRole.SELLER),
  validateRequest(ShopValidation.updateShopZodSchema),
  ShopController.updateShop,
);

export const ShopRoutes = router;
