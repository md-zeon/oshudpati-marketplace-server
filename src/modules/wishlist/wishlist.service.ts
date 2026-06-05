import { prisma } from "../../lib/prisma";

const toggleWishlist = async (userId: string, medicineId: string) => {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
    return { added: false };
  }

  await prisma.wishlist.create({
    data: { userId, medicineId },
  });

  return { added: true };
};

const getMyWishlist = async (userId: string) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      medicine: {
        include: {
          images: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items;
};

const isWishlisted = async (userId: string, medicineId: string) => {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
  });

  return !!existing;
};

const removeFromWishlist = async (userId: string, wishlistId: string) => {
  const item = await prisma.wishlist.findFirstOrThrow({
    where: { id: wishlistId, userId },
  });

  await prisma.wishlist.delete({
    where: { id: item.id },
  });

  return { removed: true };
};

export const WishlistService = {
  toggleWishlist,
  getMyWishlist,
  isWishlisted,
  removeFromWishlist,
};
