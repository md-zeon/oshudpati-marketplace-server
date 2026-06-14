import { z } from "zod";

const addToCartZodSchema = z.object({
  body: z.object({
    medicineId: z.string().uuid("Invalid medicine ID format"),
    quantity: z
      .number("Quantity must be a number")
      .int("Quantity must be an integer"),
  }),
});

const updateCartItemQuantityZodSchema = z.object({
  body: z.object({
    quantity: z
      .number("Quantity must be a number")
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0"),
  }),

  params: z.object({
    id: z.string().uuid("Invalid cart item ID format"),
  }),
});

const removeCartItemZodSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid cart item ID format"),
  }),
});

const mergeGuestCartZodSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        medicineId: z.string().uuid("Invalid medicine ID format"),
        quantity: z
          .number("Quantity must be a number")
          .int("Quantity must be an integer")
          .positive("Quantity must be greater than 0"),
      }),
    ),
  }),
});

export const CartValidation = {
  addToCartZodSchema,
  updateCartItemQuantityZodSchema,
  removeCartItemZodSchema,
  mergeGuestCartZodSchema,
};
