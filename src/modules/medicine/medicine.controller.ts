import { Request, Response, NextFunction } from "express";
import { MedicineService } from "./medicine.service";
import { parsePaginationParams } from "../../lib/utils";

const createMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id;

    const medicine = await MedicineService.createMedicine(
      sellerId as string,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

const getAllMedicines = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, isFeatured } = req.query;

    const queryParams = {
      search: typeof search === "string" ? search : undefined,
      isFeatured:
        typeof isFeatured === "string"
          ? isFeatured.toLowerCase() === "true"
          : undefined,
    };

    const paginationParams = parsePaginationParams(req.query);
    const { medicines, meta } = await MedicineService.getAllMedicines(
      queryParams,
      paginationParams,
    );

    res.status(200).json({
      success: true,
      message:
        medicines.length > 0
          ? "Medicines retrieved successfully"
          : "No medicines found",
      data: medicines,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single medicine by ID
const getMedicineById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const medicineId = req.params.id;
    const medicine = await MedicineService.getMedicineById(
      medicineId as string,
    );

    res.status(200).json({
      success: true,
      message: "Medicine retrieved successfully",
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single medicine by slug
const getMedicineBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = req.params.slug;
    const medicine = await MedicineService.getMedicineBySlug(slug as string);

    res.status(200).json({
      success: true,
      message: "Medicine retrieved successfully",
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
};

// Update a medicine
const updateMedicine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const medicineId = req.params.id;
    const updatedMedicine = await MedicineService.updateMedicine(
      medicineId as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine,
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete a medicine
const deleteMedicineSoft = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const medicineId = req.params.id;

    await MedicineService.deleteMedicineSoft(medicineId as string);

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const MedicineController = {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  getMedicineBySlug,
  updateMedicine,
  deleteMedicineSoft,
};
