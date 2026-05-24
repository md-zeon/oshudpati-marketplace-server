import { z } from "zod";

// 1. Used when POSTing a brand new category
const createCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Category name is required",
      })
      .min(3, "Category name must be at least 3 characters long")
      .max(50, "Category name cannot exceed 50 characters"),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    imageUrl: z
      .string()
      .url("Invalid image layout format. Must be a valid URL")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

// 2. Used when PATCHing an existing category (everything is optional)
const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Category name must be at least 3 characters long")
      .max(50, "Category name cannot exceed 50 characters")
      .optional(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase and can only contain letters, numbers, and hyphens",
      )
      .optional(),
    imageUrl: z
      .string()
      .url("Invalid image layout format. Must be a valid URL")
      .optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Category ID format. Must be a valid UUID"),
  }),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
