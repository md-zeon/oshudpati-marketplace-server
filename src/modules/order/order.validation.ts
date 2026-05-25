import { z } from "zod";
import { OrderStatus } from "../../../generated/prisma/enums";

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
          medicineId: z
            .string()
            .uuid("Invalid medicine identifier uuid format"),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1, "At least one item is required"),
  }),
});

const getOrderByIdZodSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Invalid order identifier uuid format"),
  }),
});

const updateOrderStatusZodSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Invalid order identifier uuid format"),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      error: `Status must be one of: ${Object.values(OrderStatus).join(", ")}`,
    }),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
  getOrderByIdZodSchema,
  updateOrderStatusZodSchema,
};
