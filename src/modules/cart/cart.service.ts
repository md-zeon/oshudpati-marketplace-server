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

    select: {
      id: true,
      userId: true,
      medicineId: true,
      quantity: true,

      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          slug: true,
          price: true,
          discountPrice: true,
          stockQuantity: true,
          images: true,
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

const getCartSummary = async (userId: string) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      medicine: {
        include: {
          images: true,
        },
      },
    },
  });

  let subtotal = 0;
  let totalDiscount = 0;
  let totalItems = 0;

  const items = cartItems.map((item) => {
    const price = Number(item.medicine.price);
    const discountPrice = item.medicine.discountPrice
      ? Number(item.medicine.discountPrice)
      : price;

    const itemSubtotal = discountPrice * item.quantity;
    const originalSubtotal = price * item.quantity;

    subtotal += itemSubtotal;
    totalDiscount += originalSubtotal - itemSubtotal;
    totalItems += item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      medicine: {
        id: item.medicine.id,
        name: item.medicine.name,
        price: item.medicine.price,
        discountPrice: item.medicine.discountPrice,
        images: item.medicine.images,
      },
      subtotal: itemSubtotal,
    };
  });

  return {
    items,
    totalItems,
    subtotal,
    totalDiscount,
    finalTotal: subtotal,
  };
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
  getCartSummary,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
