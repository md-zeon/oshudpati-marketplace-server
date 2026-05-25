import { z } from "zod";
import { DosageForm } from "../../../generated/prisma/enums";

const createMedicineZodSchema = z.object({
  body: z
    .object({
      name: z.string({ error: "Medicine name is required" }).min(1),
      genericName: z.string({ error: "Generic name is required" }).min(1),
      shortDescription: z.string().max(255).optional(),
      description: z.string().optional(),
      indications: z.string().optional(),
      dosageInstructions: z.string().optional(),
      sideEffects: z.string().optional(),
      manufacturerName: z.string({
        error: "Manufacturer name is required",
      }),
      brandName: z.string().optional(),
      dosageForm: z.nativeEnum(DosageForm, {
        error: "Invalid dosage form enum type",
      }),
      strength: z.string().optional(),
      unitPresentation: z.string({
        error: "Unit presentation (e.g., 10 Tablets) is required",
      }),
      sku: z.string().optional(),
      price: z
        .number({ error: "Base price is required" })
        .positive("Price must be greater than 0"),
      discountPrice: z
        .number("Discount price must be a number")
        .positive("Discount price must be a positive number")
        .optional(),
      stockQuantity: z
        .number("Stock quantity must be a number")
        .int("Stock quantity must be an integer")
        .nonnegative("Stock quantity must be a non-negative integer")
        .default(0),
      isFeatured: z.boolean("Featured status must be a boolean").optional(),
      categoryId: z.string({ error: "Category ID is required" }).uuid(),

      images: z
        .array(
          z.object({
            imageUrl: z.string().url("Each image must have a valid URL format"),
            altText: z.string("Alt text must be a string").optional(),
            isPrimary: z
              .boolean("Primary image status must be a boolean")
              .default(false),
          }),
        )
        .min(1, "You must provide at least one image for the medicine listing"),
    })
    .refine(
      (data) => {
        if (data.discountPrice && data.discountPrice >= data.price) {
          return false;
        }
        return true;
      },
      {
        message:
          "Discount price must be strictly less than the standard retail price",
        path: ["discountPrice"],
      },
    ),
});

const updateMedicineZodSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      genericName: z.string().optional(),
      shortDescription: z.string().max(255).optional(),
      description: z.string().optional(),
      indications: z.string().optional(),
      dosageInstructions: z.string().optional(),
      sideEffects: z.string().optional(),
      manufacturerName: z.string().optional(),
      brandName: z.string().optional(),
      dosageForm: z.nativeEnum(DosageForm).optional(),
      strength: z.string().optional(),
      unitPresentation: z.string().optional(),
      sku: z.string().optional(),
      price: z.number("Price must be a number").positive().optional(),
      discountPrice: z
        .number("Discount price must be a number")
        .positive("Discount price must be a positive number")
        .optional(),
      stockQuantity: z
        .number("Stock quantity must be a number")
        .int("Stock quantity must be an integer")
        .nonnegative("Stock quantity must be a non-negative integer")
        .optional(),
      isFeatured: z.boolean("Featured status must be a boolean").optional(),
      isActive: z.boolean("Active status must be a boolean").optional(),
      categoryId: z
        .string()
        .uuid("Invalid category identifier UUID format")
        .optional(),

      images: z
        .array(
          z.object({
            id: z.string().uuid().optional(),
            imageUrl: z.string().url(),
            altText: z.string().optional(),
            isPrimary: z.boolean().optional(),
          }),
        )
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update medicine",
    }),

  params: z.object({
    id: z.string().uuid(),
  }),
});

const getSingleMedicineBySlugZodSchema = z.object({
  params: z.object({
    slug: z.string({
      error: "Medicine lookup slug parameter is required",
    }),
  }),
});

const getsingleMedicineByIdZodSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Medicine identifier UUID format"),
  }),
});

const deleteMedicineZodSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Medicine identifier UUID format"),
  }),
});

export const MedicineValidation = {
  createMedicineZodSchema,
  updateMedicineZodSchema,
  getSingleMedicineBySlugZodSchema,
  getsingleMedicineByIdZodSchema,
  deleteMedicineZodSchema,
};
