import { NextFunction, Request, Response } from "express";
import { WishlistService } from "./wishlist.service";

const toggleWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { medicineId } = req.body;

    const result = await WishlistService.toggleWishlist(userId, medicineId);

    res.status(200).json({
      success: true,
      message: result.added ? "Added to wishlist" : "Removed from wishlist",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const items = await WishlistService.getMyWishlist(userId);

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

const isWishlisted = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const medicineId = req.params.medicineId as string;

    const wishlisted = await WishlistService.isWishlisted(userId, medicineId);

    res.status(200).json({
      success: true,
      data: { wishlisted },
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const wishlistId = req.params.id as string;

    await WishlistService.removeFromWishlist(userId, wishlistId);

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const WishlistController = {
  toggleWishlist,
  getMyWishlist,
  isWishlisted,
  removeFromWishlist,
};
