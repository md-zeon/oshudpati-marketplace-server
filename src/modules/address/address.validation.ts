import { z } from "zod";

const createAddressZodSchema = z.object({
  body: z.object({
    fullName: z.string(),
    phoneNumber: z.string(),
    division: z.string(),
    district: z.string(),
    area: z.string(),
    streetAddress: z.string(),
    postalCode: z.string().optional(),
    addressLabel: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressZodSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    area: z.string().optional(),
    streetAddress: z.string().optional(),
    postalCode: z.string().optional(),
    addressLabel: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),
});

const addressIdZodSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const AddressValidation = {
  createAddressZodSchema,
  updateAddressZodSchema,
  addressIdZodSchema,
};
