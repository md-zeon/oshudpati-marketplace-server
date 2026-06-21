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
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
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
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`Send verification email to ${user.email} with URL: ${url}`);

      try {
        const info = await transporter.sendMail({
          from: `Oshudpati Marketplace <${process.env.APP_USER}>`,
          to: user.email,
          subject: "Verify your email address",
          text: `Hello, ${user.name}. Please confirm your email address to finish creating your account and start using Oshudpati Marketplace.\n\nClick the link below to verify your email:\n${url}\n\nIf you did not request this email, you can safely ignore it.`,
          html: `
            <div style="margin:0;padding:0;background-color:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f8fb;padding:40px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                      <tr>
                        <td style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:32px 40px;color:#ffffff;">
                          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;margin-bottom:10px;">Oshudpati Marketplace</div>
                          <h1 style="margin:0;font-size:28px;line-height:1.2;">Verify your email address</h1>
                          <p style="margin:12px 0 0;font-size:16px;line-height:1.6;max-width:520px;">Hello ${user.name},<br>Please confirm your email address to finish creating your account and start using Oshudpati Marketplace.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155;">Click the button below to verify your email. If the button does not work, copy and paste the link into your browser.</p>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="${url}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;line-height:1;border-radius:999px;padding:16px 28px;">Verify Email</a>
                          </div>
                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin:0 0 24px;word-break:break-all;">
                            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Verification link</div>
                            <a href="${url}" style="color:#0f766e;text-decoration:none;">${url}</a>
                          </div>
                          <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">If you did not request this email, you can safely ignore it.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          `,
        });

        console.log("Verification email sent:", info.messageId);
      } catch (error) {
        console.log("Error sending verification email:", error);
      }
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
  },
});
