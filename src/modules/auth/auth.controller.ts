import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";

const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: You must be logged in to access this resource.",
      });
    }

    const currentUser = await AuthService.getCurrentUser(user.id);

    res.json({
      success: true,
      message: "User retrieved successfully",
      data: currentUser,
    });
  } catch (error) {
    next(error);
  }
};

export const AuthController = {
  getCurrentUser,
};
