import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";

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

export const orderController = {
  createOrder,
};
