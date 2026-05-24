import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
      },
      accountStatus: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      shopName: {
        type: "string",
        required: false,
      },
    },
  },
});
