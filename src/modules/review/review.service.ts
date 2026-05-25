import { prisma } from "../../lib/prisma";

const createReview = async (
  customerId: string,
  payload: {
    medicineId: string;
    rating: number;
    comment?: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    // prevent duplicate review (extra safety)
    const existing = await tx.review.findUnique({
      where: {
        customerId_medicineId: {
          customerId,
          medicineId: payload.medicineId,
        },
      },
    });

    if (existing) {
      throw new Error("You have already reviewed this medicine");
    }

    const review = await tx.review.create({
      data: {
        customerId,
        ...payload,
      },
    });

    // update medicine stats
    const reviews = await tx.review.findMany({
      where: { medicineId: payload.medicineId },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await tx.medicine.update({
      where: { id: payload.medicineId },
      data: {
        averageRating: avgRating,
        reviewCount: reviews.length,
      },
    });

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

    // recalculate rating
    const reviews = await tx.review.findMany({
      where: { medicineId: review.medicineId },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await tx.medicine.update({
      where: { id: review.medicineId },
      data: {
        averageRating: avgRating,
      },
    });

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

    const reviews = await tx.review.findMany({
      where: { medicineId: review.medicineId },
    });

    const avgRating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await tx.medicine.update({
      where: { id: review.medicineId },
      data: {
        averageRating: avgRating,
        reviewCount: reviews.length,
      },
    });

    return true;
  });
};

export const ReviewService = {
  createReview,
  getMedicineReviews,
  updateReview,
  deleteReview,
};
