import { Request, Response, NextFunction } from "express";
import { AddressService } from "./address.service";

const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const result = await AddressService.createAddress(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const result = await AddressService.getMyAddresses(userId);

    res.json({
      success: true,
      message: "Addresses fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const addressId = req.params.id as string;

    const result = await AddressService.getAddressById(userId, addressId);

    res.json({
      success: true,
      message: "Address details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const result = await AddressService.updateAddress(
      userId,
      req.params.id as string,
      req.body,
    );

    res.json({
      success: true,
      message: "Address updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    await AddressService.deleteAddress(userId, req.params.id as string);

    res.json({
      success: true,
      message: "Address deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const result = await AddressService.setDefaultAddress(
      userId,
      req.params.id as string,
    );

    res.json({
      success: true,
      message: "Default address updated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AddressController = {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
