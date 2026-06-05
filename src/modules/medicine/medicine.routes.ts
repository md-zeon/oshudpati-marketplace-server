import { Router } from "express";
import { MedicineController } from "./medicine.controller";
import auth, { UserRole } from "../../middlewares/auth";
import { MedicineValidation } from "./medicine.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router: Router = Router();

// Get all medicines
router.get("/", MedicineController.getAllMedicines);

// Get my medicines (seller)
router.get(
  "/my-medicines",
  auth(UserRole.SELLER),
  MedicineController.getMyMedicines,
);

// get all medicine manufacturers
router.get("/manufacturers", MedicineController.getAllManufacturers);

// Get a single medicine by ID
router.get(
  "/:id",
  validateRequest(MedicineValidation.getsingleMedicineByIdZodSchema),
  MedicineController.getMedicineById,
);

// Get a single medicine by slug
router.get(
  "/slug/:slug",
  validateRequest(MedicineValidation.getSingleMedicineBySlugZodSchema),
  MedicineController.getMedicineBySlug,
);

// Create a new medicine
router.post(
  "/",
  auth(UserRole.SELLER),
  validateRequest(MedicineValidation.createMedicineZodSchema),
  MedicineController.createMedicine,
);

// Update a medicine
router.patch(
  "/:id",
  auth(UserRole.SELLER),
  validateRequest(MedicineValidation.updateMedicineZodSchema),
  MedicineController.updateMedicine,
);

// Delete a medicine
router.delete(
  "/:id",
  auth(UserRole.SELLER),
  validateRequest(MedicineValidation.deleteMedicineZodSchema),
  MedicineController.deleteMedicineSoft,
);

export const MedicineRoutes = router;
