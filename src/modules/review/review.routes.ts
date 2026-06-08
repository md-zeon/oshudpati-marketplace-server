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

export const ReviewRoutes = router;
