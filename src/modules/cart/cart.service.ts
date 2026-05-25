import { prisma } from "../../lib/prisma";

const addToCart = async (
  userId: string,
  payload: {
    medicineId: string;
    quantity: number;
  },
) => {
  const { medicineId, quantity } = payload;

  // validate medicine
  const medicine = await prisma.medicine.findUniqueOrThrow({
    where: {
      id: medicineId,
      isActive: true,
    },
  });

  // check existing cart item
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
  });

  // combined quantity validation
  const totalQuantity = (existingCartItem?.quantity || 0) + quantity;

  if (totalQuantity > medicine.stockQuantity) {
    throw new Error(`Only ${medicine.stockQuantity} items available in stock`, {
      cause: {
        name: "StockError",
        currentStock: medicine.stockQuantity,
        requestedQuantity: totalQuantity,
      },
    });
  }

  // update existing cart item
  if (existingCartItem) {
    return prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: totalQuantity,
      },
      include: {
        medicine: {
          include: {
            images: true,
            seller: true,
          },
        },
      },
    });
  }

  // create new cart item
  return prisma.cartItem.create({
    data: {
      userId,
      medicineId,
      quantity,
    },
    include: {
      medicine: {
        include: {
          images: true,
          seller: true,
        },
      },
    },
  });
};

const getMyCart = async (userId: string) => {
  return prisma.cartItem.findMany({
    where: {
      userId,
    },

    include: {
      medicine: {
        include: {
          images: true,
          seller: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateCartItemQuantity = async (
  userId: string,
  cartItemId: string,
  quantity: number,
) => {
  const cartItem = await prisma.cartItem.findFirstOrThrow({
    where: {
      id: cartItemId,
      userId,
    },

    include: {
      medicine: true,
    },
  });

  // stock validation
  if (quantity > cartItem.medicine.stockQuantity) {
    throw new Error(
      `Only ${cartItem.medicine.stockQuantity} items available in stock`,
      {
        cause: {
          name: "StockError",
          currentStock: cartItem.medicine.stockQuantity,
          requestedQuantity: quantity,
        },
      },
    );
  }

  return prisma.cartItem.update({
    where: {
      id: cartItemId,
    },

    data: {
      quantity,
    },

    include: {
      medicine: {
        include: {
          images: true,
          seller: true,
        },
      },
    },
  });
};

const removeCartItem = async (userId: string, cartItemId: string) => {
  // validate ownership
  await prisma.cartItem.findFirstOrThrow({
    where: {
      id: cartItemId,
      userId,
    },
  });

  return prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });
};

const clearCart = async (userId: string) => {
  return prisma.cartItem.deleteMany({
    where: {
      userId,
    },
  });
};

export const CartService = {
  addToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
