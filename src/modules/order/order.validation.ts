import { z } from "zod";

const addressSnapshotSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  division: z.string(),
  district: z.string(),
  area: z.string(),
  streetAddress: z.string(),
  postalCode: z.string().optional(),
  addressLabel: z.string().optional(),
});

const createOrderZodSchema = z.object({
  body: z.object({
    shippingAddressSnapshot: addressSnapshotSchema,

    customerNote: z.string().optional(),

    items: z
      .array(
        z.object({
          medicineId: z.string().uuid(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1, "At least one item is required"),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
};
