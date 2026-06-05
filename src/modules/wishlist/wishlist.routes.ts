import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { WishlistController } from "./wishlist.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { WishlistValidation } from "./wishlist.validation";

const router: Router = Router();

router.get("/", auth(UserRole.CUSTOMER), WishlistController.getMyWishlist);

router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(WishlistValidation.toggleWishlistZodSchema),
  WishlistController.toggleWishlist,
);

router.delete(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(WishlistValidation.wishlistIdZodSchema),
  WishlistController.removeFromWishlist,
);

router.get(
  "/check/:medicineId",
  auth(UserRole.CUSTOMER),
  WishlistController.isWishlisted,
);

export const WishlistRoutes = router;
