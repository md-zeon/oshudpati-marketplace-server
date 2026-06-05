import { NextFunction, Request, Response } from "express";
import { ShopService } from "./shop.service";

const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.id as string;

    const shop = await ShopService.createShop(sellerId, req.body);

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

const getMyShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.id as string;

    const shop = await ShopService.getMyShop(sellerId);

    res.status(200).json({
      success: true,
      message: "Shop retrieved successfully",
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

const getShopBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shop = await ShopService.getShopBySlug(req.params.slug as string);

    res.status(200).json({
      success: true,
      message: "Shop retrieved successfully",
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

const updateShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.id as string;

    const shop = await ShopService.updateShop(sellerId, req.body);

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

export const ShopController = {
  createShop,
  getMyShop,
  getShopBySlug,
  updateShop,
};
