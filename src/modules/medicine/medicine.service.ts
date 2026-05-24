import { Medicine } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/utils";

const createMedicine = async (
  sellerId: string,
  payload: Omit<
    Medicine,
    "id" | "sellerId" | "createdAt" | "updatedAt" | "slug"
  >,
) => {
  const slug = generateSlug(
    payload.name,
    payload.strength ?? payload.genericName,
    payload.dosageForm,
  );

  const medicineData = {
    ...payload,
    sellerId,
    slug,
  };

  const res = await prisma.medicine.create({
    data: medicineData,
  });

  return res;
};

const getAllMedicines = async () => {

};

export const MedicineService = {
  createMedicine,
  getAllMedicines,
};
