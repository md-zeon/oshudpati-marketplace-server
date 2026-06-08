import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?.id as string;

    const result = await ReviewService.createReview(customerId, req.body);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMedicineReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ReviewService.getMedicineReviews(
      req.params.medicineId as string,
    );

    res.json({
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?.id as string;

    const result = await ReviewService.updateReview(
      customerId,
      req.params.id as string,
      req.body,
    );

    res.json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?.id as string;

    await ReviewService.deleteReview(customerId, req.params.id as string);

    res.json({
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ReviewService.getAllReviews();

    res.json({
      success: true,
      message: "All reviews fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ReviewController = {
  createReview,
  getMedicineReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
