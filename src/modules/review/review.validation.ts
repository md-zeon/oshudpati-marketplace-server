import { z } from "zod";

const createReviewZodSchema = z.object({
  body: z.object({
    medicineId: z.string().uuid(),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z.string().max(500).optional(),
  }),
});

const updateReviewZodSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const reviewIdZodSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
  reviewIdZodSchema,
};
