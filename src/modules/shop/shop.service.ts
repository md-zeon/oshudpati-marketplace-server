import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/utils";

const createShop = async (sellerId: string, payload: any) => {
  const { name, description, logo, banner } = payload;

  const slug = generateSlug(name);

  // Check if seller already has a shop
  const existing = await prisma.shop.findUnique({
    where: { sellerId },
  });

  if (existing) {
    throw new Error("You already have a shop", {
      cause: {
        name: "ShopExistsError",
        message: `Seller ${sellerId} already has a shop named "${existing.name}"`,
      },
    });
  }

  return prisma.shop.create({
    data: {
      sellerId,
      name,
      slug,
      description,
      logo,
      banner,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
};

const getMyShop = async (sellerId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { sellerId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!shop) {
    throw new Error("You haven't created a shop yet");
  }

  return shop;
};

const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUniqueOrThrow({
    where: { slug, isActive: true },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return shop;
};

const updateShop = async (sellerId: string, payload: any) => {
  const { name, ...data } = payload;

  const updateData: any = { ...data };

  if (name) {
    updateData.name = name;
    updateData.slug = generateSlug(name);
  }

  return prisma.shop.update({
    where: { sellerId },
    data: updateData,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
};

export const ShopService = {
  createShop,
  getMyShop,
  getShopBySlug,
  updateShop,
};
