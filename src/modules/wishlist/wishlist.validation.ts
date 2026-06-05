import { z } from "zod";

const toggleWishlistZodSchema = z.object({
  body: z.object({
    medicineId: z.string().uuid("Invalid medicine ID format"),
  }),
});

const wishlistIdZodSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const WishlistValidation = {
  toggleWishlistZodSchema,
  wishlistIdZodSchema,
};