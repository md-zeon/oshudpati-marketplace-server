import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserService.getAllUsers();

    res.json({
      success: true,
      message:
        users.length > 0 ? "Users retrieved successfully" : "No users found",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;
    const requestingUserId = req.user?.id;

    if (id === requestingUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot update your own account status",
        data: null,
      });
    }

    // Ensure the user exists before attempting to update
    const user = await UserService.getUserById(id as string);

    if (user.accountStatus === accountStatus) {
      return res.status(400).json({
        success: false,
        message: `User account is already in ${accountStatus} status`,
        data: null,
      });
    }

    const updatedUser = await UserService.updateUserAccountStatus(
      id as string,
      accountStatus,
    );

    res.json({
      success: true,
      message: "User account status updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  getAllUsers,
  updateUserAccountStatus,
};
