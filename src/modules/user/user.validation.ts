import { z } from "zod";
import { AccountStatus } from "../../../generated/prisma/enums";

const updateUserAccountStatusZodSchema = z.object({
  body: z.object({
    accountStatus: z.nativeEnum(AccountStatus, {
      error: `Invalid account status. Account Status must be one of ${Object.values(AccountStatus).join(", ")} `,
    }),
  }),
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export const UserValidation = {
  updateUserAccountStatusZodSchema,
};
