import { Router } from "express";
import { MedicineController } from "./medicine.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = Router();

// Get all medicines
router.get("/", MedicineController.getAllMedicines);

// Get a single medicine by ID

// Get a single medicine by slug

// Create a new medicine
router.post("/", auth(UserRole.SELLER), MedicineController.createMedicine);

export const MedicineRoutes = router;
