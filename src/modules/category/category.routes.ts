import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { CategoryController } from "./category.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryValidation } from "./category.validation";

const router: Router = Router();

// Get all categories
router.get("/", CategoryController.getAllCategories);

// get inactive categories (Admin only)
router.get(
  "/inactive",
  auth(UserRole.ADMIN),
  CategoryController.getInactiveCategories,
);

// Get category by slug
router.get(
  "/slug/:slug",
  validateRequest(CategoryValidation.getCategoryBySlugZodSchema),
  CategoryController.getCategoryBySlug,
);

// Get category by ID
router.get(
  "/:id",
  validateRequest(CategoryValidation.getCategoryByIdZodSchema),
  CategoryController.getCategoryById,
);

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

// Delete Category (Admin only)
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.getCategoryByIdZodSchema),
  CategoryController.deleteCategorySoft,
);

// Recover Category (Admin only)
router.patch(
  "/:id/recover",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.getCategoryByIdZodSchema),
  CategoryController.recoverCategory,
);

export const CategoryRoutes: Router = router;
