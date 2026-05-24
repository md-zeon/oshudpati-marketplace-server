import { z } from "zod";
import { DosageForm } from "../../../generated/prisma/enums";

const createMedicineZodSchema = z.object({
  body: z
    .object({
      name: z.string({ error: "Medicine name is required" }).min(1),
      genericName: z
        .string({ error: "Generic genericName is required" })
        .min(1),
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
      discountPrice: z.number().positive().optional(),
      stockQuantity: z
        .number()
        .int()
        .nonnegative("Stock cannot be negative")
        .default(0),
      isFeatured: z.boolean().optional(),
      categoryId: z
        .string({ error: "Category ID relation mapping is required" })
        .uuid("Invalid Category ID"),
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
  body: z.object({
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
    price: z.number().positive().optional(),
    discountPrice: z.number().positive().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Medicine identifier UUID format"),
  }),
});

const getSingleMedicineZodSchema = z.object({
  params: z.object({
    slug: z.string({
      error: "Medicine lookup slug parameter is required",
    }),
  }),
});

export const MedicineValidation = {
  createMedicineZodSchema,
  updateMedicineZodSchema,
  getSingleMedicineZodSchema,
};
