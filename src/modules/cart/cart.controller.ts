import { NextFunction, Request, Response } from "express";
import { CartService } from "./cart.service";

// add item to cart
const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;

    const cartItem = await CartService.addToCart(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;

    const cartItems = await CartService.getMyCart(userId);

    res.json({
      success: true,
      message:
        cartItems.length > 0 ? "Cart retrieved successfully" : "Cart is empty",
      data: cartItems,
    });
  } catch (error) {
    next(error);
  }
};

const getCartSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const summary = await CartService.getCartSummary(userId);

    res.json({
      success: true,
      message: "Cart summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { quantity } = req.body;

    const updatedCartItem = await CartService.updateCartItemQuantity(
      userId,
      req.params.id as string,
      quantity,
    );

    res.json({
      success: true,
      message: "Cart item quantity updated successfully",
      data: updatedCartItem,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    await CartService.removeCartItem(userId, req.params.id as string);

    res.json({
      success: true,
      message: "Cart item removed successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;

    await CartService.clearCart(userId);

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const CartController = {
  addToCart,
  getMyCart,
  getCartSummary,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
