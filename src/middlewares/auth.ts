import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { AccountStatus, UserRole } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        emailVerified: boolean;
        accountStatus: AccountStatus;
      };
    }
  }
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to perform this action.",
        });
      }

      if (session.user.accountStatus === AccountStatus.BANNED) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned. Please contact support.",
        });
      }

      if (session.user.emailVerified === false) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email to perform this action.",
        });
      }

      if (roles.length && !roles.includes(session.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You do not have permission to perform this action.",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
        accountStatus: session.user.accountStatus as AccountStatus,
      };

      next();
    } catch (error: any) {
      console.error("Authentication error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while authenticating the user.",
        errorDetails: error,
      });
    }
  };
};

export { UserRole };

export default auth;
