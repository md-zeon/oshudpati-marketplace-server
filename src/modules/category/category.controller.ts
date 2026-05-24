import { NextFunction, Request, Response } from "express";
import { CategoryService } from "./category.service";

const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await CategoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const CategoryController = {
  getAllCategories,
  createCategory,
};
