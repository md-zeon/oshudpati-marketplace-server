import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";
import { OrderStatus } from "../../../generated/prisma/enums";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id;

    const order = await OrderService.createOrder(
      customerId as string,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id;

    const orders = await OrderService.getMyOrders(customerId as string);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = req.params.orderId;
    const order = await OrderService.getOrderById(orderId as string, req.user);

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = req.params.orderId;
    const sellerId = req.user?.id;
    const newStatus = req.body.status;

    const updatedOrder = await OrderService.updateOrderStatus(
      orderId as string,
      sellerId as string,
      newStatus as OrderStatus,
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
