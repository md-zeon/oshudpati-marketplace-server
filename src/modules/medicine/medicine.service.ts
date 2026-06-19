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

    return tx.medicine.findUniqueOrThrow({
      where: { id: medicine.id },
      include: {
        category: true,
        images: true,
      },
    });
  });
};

const getMyMedicines = async (
  sellerId: string,
  metadata: {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
  },
) => {
  const { page, limit, skip } = metadata;

  const medicines = await prisma.medicine.findMany({
    where: { sellerId },
    include: {
      category: true,
      images: true,
      _count: {
        select: { orderItems: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
  });

  const total = await prisma.medicine.count({
    where: { sellerId },
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

const getAllMedicines = async (
  query: {
    search: string | undefined;
    isFeatured: boolean | undefined;
    category: string[];
    manufacturer: string[];
    minPrice: number;
    maxPrice: number;
  },
  metadata: {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
  },
) => {
  const { search, isFeatured, category, manufacturer, minPrice, maxPrice } =
    query;
  const {
    page,
    limit,
    skip,
    sortBy: sortByMeta,
    sortOrder: sortOrderMeta,
  } = metadata;

  let sortBy = "createdAt";
  let sortOrder = sortOrderMeta || "desc";

  if (sortByMeta === "latest") {
    sortBy = "createdAt";
  } else if (sortByMeta === "price-asc") {
    sortBy = "price";
    sortOrder = "asc";
  } else if (sortByMeta === "price-desc") {
    sortBy = "price";
    sortOrder = "desc";
  } else if (sortByMeta == "popular") {
    sortBy = "averageRating";
    sortOrder = "desc";
  }

  const priceFilter: { gte?: number; lte?: number } = {};

  if (Number.isFinite(minPrice)) {
    priceFilter.gte = minPrice;
  }

  if (Number.isFinite(maxPrice)) {
    priceFilter.lte = maxPrice;
  }

  const andConditions: MedicineWhereInput[] = [
    {
      isActive: true,
      ...(Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}),
    },
  ];

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

  if (category.length > 0) {
    andConditions.push({ category: { slug: { in: category } } });
  }

  if (manufacturer.length > 0) {
    andConditions.push({ manufacturerName: { in: manufacturer } });
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

const getAllManufacturers = async () => {
  const manufacturers = await prisma.medicine.findMany({
    where: { isActive: true },
    select: {
      manufacturerName: true,
    },
    distinct: ["manufacturerName"],
  });

  return manufacturers;
};

const getMedicineById = async (id: string) => {
  return await prisma.medicine.findUniqueOrThrow({
    where: { id, isActive: true },
    include: {
      category: true,
      images: true,
    },
  });
};

const getMedicineBySlug = async (slug: string) => {
  return await prisma.medicine.findUniqueOrThrow({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: true,
    },
  });
};

const updateMedicine = async (
  medicineId: string,
  payload: {
    images?: {
      id?: string;
      imageUrl: string;
      altText?: string;
      isPrimary?: boolean;
    }[];
  } & Partial<
    Omit<Medicine, "id" | "sellerId" | "createdAt" | "updatedAt" | "slug">
  >,
) => {
  const { images, price, discountPrice, ...medicineData } = payload;

  return prisma.$transaction(async (tx) => {
    const existingMedicine = await tx.medicine.findUniqueOrThrow({
      where: { id: medicineId, isActive: true },
      include: { images: true },
    });

    // Regenerate slug if important fields changed
    const slug = generateSlug(
      medicineData.name || existingMedicine.name,
      medicineData.strength ||
        existingMedicine.strength ||
        existingMedicine.genericName,
      medicineData.dosageForm || existingMedicine.dosageForm,
    );

    // Update medicine
    const updatedMedicine = await tx.medicine.update({
      where: { id: medicineId, isActive: true },
      data: {
        ...medicineData,
        slug,
        price: price !== undefined ? Number(price) : existingMedicine.price,
        discountPrice:
          discountPrice !== undefined
            ? Number(discountPrice)
            : existingMedicine.discountPrice,
      },
    });

    // Handle images
    if (images) {
      const incomingIds = images
        .filter((img) => img.id)
        .map((img) => img.id as string);

      // Delete removed images
      await tx.medicineImage.deleteMany({
        where: {
          medicineId,
          id: {
            notIn: incomingIds,
          },
        },
      });

      // Upsert remaining/new images
      for (const img of images) {
        if (img.id) {
          await tx.medicineImage.update({
            where: { id: img.id },
            data: {
              imageUrl:
                img.imageUrl ||
                (existingMedicine.images.find((i) => i.id === img.id)
                  ?.imageUrl as string),
              altText:
                img.altText ||
                (existingMedicine.images.find((i) => i.id === img.id)
                  ?.altText as string),
              isPrimary:
                img.isPrimary !== undefined
                  ? img.isPrimary
                  : (existingMedicine.images.find((i) => i.id === img.id)
                      ?.isPrimary as boolean) || false,
            },
          });
        } else {
          await tx.medicineImage.create({
            data: {
              medicineId,
              imageUrl: img.imageUrl as string,
              altText: img.altText || null,
              isPrimary: img.isPrimary || false,
            },
          });
        }
      }
    }

    return tx.medicine.findUniqueOrThrow({
      where: { id: updatedMedicine.id },
      include: {
        category: true,
        images: true,
      },
    });
  });
};

// Soft delete a medicine
const deleteMedicineSoft = async (medicineId: string) => {
  return await prisma.medicine.update({
    where: { id: medicineId },
    data: { isActive: false },
  });
};

// Hard delete a medicine
const deleteMedicine = async (medicineId: string) => {
  return await prisma.medicine.delete({
    where: { id: medicineId },
  });
};

export const MedicineService = {
  createMedicine,
  getMyMedicines,
  getAllMedicines,
  getAllManufacturers,
  getMedicineById,
  getMedicineBySlug,
  updateMedicine,
  deleteMedicineSoft,
  deleteMedicine,
};
