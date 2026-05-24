import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { CategoryController } from "./category.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryValidation } from "./category.validation";

const router: Router = Router();

// Get all categories
router.get("/", CategoryController.getAllCategories);

// Get category by ID
router.get("/:id", CategoryController.getCategoryById);

// Add a new category (Admin only)
router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory,
);

// Update Category (Admin only)
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory,
);

// Future routes for category deletion will go here

export const CategoryRoutes: Router = router;
