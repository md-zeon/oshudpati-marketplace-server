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
  baseURL: process.env.PROD_APP_URL || "http://localhost:5000",
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
            <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:40px 20px;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">

                    <table width="600" cellspacing="0" cellpadding="0"
                      style="background:#ffffff;border-radius:12px;padding:40px;">

                      <tr>
                        <td>

                          <h1 style="margin:0 0 24px;color:#0f172a;font-size:28px;">
                            Verify your email address
                          </h1>

                          <p style="font-size:16px;color:#334155;line-height:1.7;">
                            Hello ${user.name},
                          </p>

                          <p style="font-size:16px;color:#334155;line-height:1.7;">
                            Thank you for creating an account with Oshudpati Marketplace.
                            Please verify your email address to activate your account.
                          </p>

                          <div style="margin:32px 0;text-align:center;">
                            <a
                              href="${url}"
                              style="
                                display:inline-block;
                                background:#0f766e;
                                color:#ffffff;
                                text-decoration:none;
                                padding:14px 28px;
                                border-radius:8px;
                                font-weight:600;
                              "
                            >
                              Verify Email
                            </a>
                          </div>

                          <p style="font-size:14px;color:#64748b;line-height:1.7;">
                            If the button doesn't work, copy and paste this link into your browser:
                          </p>

                          <p style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            padding:12px;
                            border-radius:8px;
                            word-break:break-word;
                            font-size:14px;
                          ">
                            ${url}
                          </p>

                          <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">

                          <p style="font-size:13px;color:#94a3b8;line-height:1.6;">
                            If you didn't create this account, you can safely ignore this email.
                          </p>

                          <p style="font-size:13px;color:#94a3b8;line-height:1.6;">
                            Oshudpati Marketplace
                          </p>

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
