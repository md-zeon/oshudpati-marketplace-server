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

const getSellerDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id as string;

    const dashboard = await DashboardService.getSellerDashboard(sellerId);

    res.status(200).json({
      success: true,
      message: "Seller dashboard data retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dashboard = await DashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const DashboardController = {
  getCustomerDashboard,
  getSellerDashboard,
  getAdminDashboard,
};
