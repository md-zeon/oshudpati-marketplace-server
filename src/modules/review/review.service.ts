import { prisma } from "../../lib/prisma";

const recalcMedicineRating = async (tx: any, medicineId: string) => {
  const stats = await tx.review.aggregate({
    where: { medicineId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.medicine.update({
    where: { id: medicineId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
};

const createReview = async (
  customerId: string,
  payload: {
    medicineId: string;
    rating: number;
    comment?: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const hasPurchased = await tx.orderItem.findFirst({
      where: {
        medicineId: payload.medicineId,
        vendorOrder: {
          order: {
            customerId,
          },
        },
      },
    });

    if (!hasPurchased) {
      throw new Error("You can only review purchased medicines", {
        cause: {
          name: "UnauthorizedReviewError",
          medicineId: payload.medicineId,
        },
      });
    }

    // prevent duplicate review
    const existing = await tx.review.findUnique({
      where: {
        customerId_medicineId: {
          customerId,
          medicineId: payload.medicineId,
        },
      },
    });

    if (existing) {
      throw new Error("You have already reviewed this medicine", {
        cause: {
          name: "DuplicateReviewError",
          medicineId: payload.medicineId,
        },
      });
    }

    const review = await tx.review.create({
      data: {
        customerId,
        ...payload,
      },
    });

    await recalcMedicineRating(tx, payload.medicineId);

    return review;
  });
};

const getMedicineReviews = async (medicineId: string) => {
  return prisma.review.findMany({
    where: { medicineId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateReview = async (
  customerId: string,
  reviewId: string,
  payload: { rating?: number; comment?: string },
) => {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.findFirstOrThrow({
      where: { id: reviewId, customerId },
    });

    const updated = await tx.review.update({
      where: { id: review.id },
      data: payload,
    });

    await recalcMedicineRating(tx, review.medicineId);

    return updated;
  });
};

const deleteReview = async (customerId: string, reviewId: string) => {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.findFirstOrThrow({
      where: { id: reviewId, customerId },
    });

    await tx.review.delete({
      where: { id: review.id },
    });

    // recalculate rating and review count and update medicine stats
    await recalcMedicineRating(tx, review.medicineId);

    return true;
  });
};

const getAllReviews = async () => {
  return prisma.review.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      medicine: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
};

export const ReviewService = {
  createReview,
  getMedicineReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
