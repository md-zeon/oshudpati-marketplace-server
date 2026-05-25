import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL || "http://localhost:3000"],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
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
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log("Send verification email to:", user.email);
      const verificationURL = `${process.env.APP_URL}/verify-email?token=${token}`;
      console.log("Verification URL:", verificationURL);
      console.log(`Send verification email to ${user.email} with URL: ${url}`);

      try {
        const info = await transporter.sendMail({
          from: `Oshudpati Marketplace <${process.env.APP_USER}>`,
          to: user.email,
          subject: "Verify your email for Oshudpati Marketplace",
          html: ``,
        });

        console.log("Verification email sent:", info.response);
      } catch (error) {
        console.log("Error sending verification email:", error);
      }
    },
  },
});
