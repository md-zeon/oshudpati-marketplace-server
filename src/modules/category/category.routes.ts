import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { CategoryController } from "./category.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryValidation } from "./category.validation";

const router: Router = Router();

// Get all categories
router.get("/", CategoryController.getAllCategories);

// Add a new category (Admin only)
router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory,
);

export const CategoryRoutes: Router = router;
