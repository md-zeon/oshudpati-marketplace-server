import { z } from "zod";

const createShopZodSchema = z.object({
  body: z.object({
    name: z.string({ error: "Shop name is required" }).min(2).max(100),
    description: z.string().max(500).optional(),
    logo: z.string().url().optional(),
    banner: z.string().url().optional(),
  }),
});

const updateShopZodSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      logo: z.string().url().optional(),
      banner: z.string().url().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

const getShopBySlugZodSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
});

export const ShopValidation = {
  createShopZodSchema,
  updateShopZodSchema,
  getShopBySlugZodSchema,
};
