import { Medicine } from "../../../generated/prisma/client";
import { MedicineWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/utils";

const createMedicine = async (
  sellerId: string,
  payload: {
    images: { imageUrl: string; altText?: string; isPrimary?: boolean }[];
  } & Omit<Medicine, "id" | "sellerId" | "createdAt" | "updatedAt" | "slug">,
) => {
  const slug = generateSlug(
    payload.name,
    payload.strength ?? payload.genericName,
    payload.dosageForm,
  );

  const { images, price, discountPrice = null, ...medicineData } = payload;

  return await prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.create({
      data: {
        ...medicineData,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        sellerId,
        slug,
      },
    });

    await tx.medicineImage.createMany({
      data: images.map((img) => ({
        medicineId: medicine.id,
        imageUrl: img.imageUrl,
        altText:
          img.altText ||
          `${medicineData.name} ${medicineData.strength || medicineData.genericName} ${medicineData.dosageForm}`,
        isPrimary: img.isPrimary || false,
      })),
    });

    return tx.medicine.findUnique({
      where: { id: medicine.id },
      include: {
        category: true,
        images: true,
      },
    });
  });
};

const getAllMedicines = async (
  query: {
    search: string | undefined;
    isFeatured: boolean | undefined;
  },
  metadata: {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
  },
) => {
  const { search, isFeatured } = query;
  const { page, limit, skip, sortBy, sortOrder } = metadata;

  const andConditions: MedicineWhereInput[] = [{ isActive: true }];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
        { manufacturerName: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (typeof isFeatured === "boolean") {
    andConditions.push({ isFeatured });
  }

  const medicines = await prisma.medicine.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      images: true,
    },
  });

  const total = await prisma.medicine.count({
    where: {
      AND: andConditions,
    },
  });

  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1,
  };

  return { medicines, meta };
};

export const MedicineService = {
  createMedicine,
  getAllMedicines,
};
