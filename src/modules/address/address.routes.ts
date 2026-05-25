import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AddressController } from "./address.controller";
import { AddressValidation } from "./address.validation";

const router: Router = Router();

// create address
router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(AddressValidation.createAddressZodSchema),
  AddressController.createAddress,
);

// get my addresses
router.get("/", auth(UserRole.CUSTOMER), AddressController.getMyAddresses);

// update address
router.patch(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(AddressValidation.updateAddressZodSchema),
  AddressController.updateAddress,
);

// delete address
router.delete(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(AddressValidation.addressIdZodSchema),
  AddressController.deleteAddress,
);

// set default address
router.patch(
  "/:id/default",
  auth(UserRole.CUSTOMER),
  validateRequest(AddressValidation.addressIdZodSchema),
  AddressController.setDefaultAddress,
);

export const AddressRoutes = router;
