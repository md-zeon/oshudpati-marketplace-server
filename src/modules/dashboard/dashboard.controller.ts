import { NextFunction, Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

const getCustomerDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?.id as string;

    const dashboard = await DashboardService.getCustomerDashboard(customerId);

    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const DashboardController = {
  getCustomerDashboard,
};
