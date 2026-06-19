import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router: Router = Router();

router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview,
);

router.get("/medicine/:medicineId", ReviewController.getMedicineReviews);

// Admin route to get all reviews
router.get("/all", auth(UserRole.ADMIN), ReviewController.getAllReviews);

router.patch(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview,
);

router.delete(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.reviewIdZodSchema),
  ReviewController.deleteReview,
);

// Admin: Toggle review visibility
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  ReviewController.toggleReviewStatus,
);

// Admin: Add/update reply to review
router.patch("/:id/reply", auth(UserRole.ADMIN), ReviewController.addReply);

export const ReviewRoutes = router;
