import { OrderStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { calculateDeliveryFee } from "../../lib/utils";

type ShippingAddressSnapshot = {
  fullName: string;
  phoneNumber: string;
  division: string;
  district: string;
  area: string;
  streetAddress: string;
  postalCode?: string;
  addressLabel?: string;
};

const generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};

const createOrder = async (
  customerId: string,
  payload: {
    shippingAddressSnapshot: ShippingAddressSnapshot;
    customerNote?: string;
    items: {
      medicineId: string;
      quantity: number;
    }[];
  },
) => {
  const { shippingAddressSnapshot, customerNote, items } = payload;

  return prisma.$transaction(async (tx) => {
    // validate medicines
    const medicineIds = items.map((i) => i.medicineId);

    // check for duplicate medicineIds in the order
    const uniqueMedicineIds = new Set(medicineIds);

    if (uniqueMedicineIds.size !== medicineIds.length) {
      throw new Error("Duplicate medicines are not allowed in order", {
        cause: {
          name: "DuplicateMedicineError",
          message: "Order contains duplicate medicine IDs",
        },
      });
    }

    // fetch medicines with seller info and images
    const medicines = await tx.medicine.findMany({
      where: {
        id: { in: medicineIds },
        isActive: true,
      },
      include: {
        images: true,
      },
    });

    // create a map for quick lookup of medicines by id
    const medicineMap = new Map(
      medicines.map((medicine) => [medicine.id, medicine]),
    );

    // check if all medicines are valid and active
    if (medicines.length !== medicineIds.length) {
      throw new Error("Some medicines are invalid or inactive");
    }

    // stock validation
    for (const item of items) {
      // find the medicine from the fetched list
      const medicine = medicineMap.get(item.medicineId)!;

      // check stock
      if (medicine.stockQuantity < item.quantity) {
        throw new Error(`${medicine.name} out of stock`, {
          cause: {
            name: "InsufficientStockError",
            message: `${medicine.name} has only ${medicine.stockQuantity} items left in stock`,
            medicineId: medicine.id,
            requestedQuantity: item.quantity,
            availableStock: medicine.stockQuantity,
          },
        });
      }
    }

    // group by seller to create vendor orders
    const grouped: Record<string, any[]> = {};

    // group items by sellerId
    for (const item of items) {
      // find the medicine from the fetched list
      const medicine = medicineMap.get(item.medicineId)!;

      // initialize group if not exists
      if (!grouped[medicine.sellerId]) {
        grouped[medicine.sellerId] = [];
      }

      // push medicine and quantity to the respective seller group
      grouped[medicine.sellerId]!.push({
        medicine,
        quantity: item.quantity,
      });
    }

    // calculate totals
    let subtotal = 0;

    // iterate over grouped items to calculate subtotal
    Object.values(grouped).forEach((list) => {
      // list is an array of { medicine, quantity }
      list.forEach(({ medicine, quantity }) => {
        const price = Number(medicine.discountPrice ?? medicine.price);
        subtotal += price * quantity;
      });
    });

    const deliveryFee = calculateDeliveryFee(subtotal);
    const totalAmount = subtotal + deliveryFee;

    // 1. create order
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,

        shippingAddressSnapshot,

        customerNote: customerNote ?? null,

        subtotalAmount: new Prisma.Decimal(subtotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(totalAmount),
      },
    });

    // 2. vendor orders + items
    // iterate over grouped items to create vendor orders and order items
    for (const sellerId in grouped) {
      // sellerId is the key, grouped[sellerId] is the array of items for that seller
      const sellerItems = grouped[sellerId]!;

      let vendorSubtotal = 0;

      sellerItems.forEach(({ medicine, quantity }) => {
        const price = Number(medicine.discountPrice ?? medicine.price);
        vendorSubtotal += price * quantity;
      });

      // create vendor order for this seller
      const vendorOrder = await tx.vendorOrder.create({
        data: {
          orderId: order.id,
          sellerId,
          vendorSubtotal: new Prisma.Decimal(vendorSubtotal),
        },
      });

      // create order items for this vendor order
      for (const item of sellerItems) {
        const medicine = item.medicine;
        const unitPrice = Number(medicine.discountPrice ?? medicine.price);

        // find primary image
        const primaryImage = medicine.images.find(
          (img: { isPrimary: boolean }) => img.isPrimary,
        );

        // create order item
        await tx.orderItem.create({
          data: {
            vendorOrderId: vendorOrder.id,
            medicineId: medicine.id,

            medicineNameSnapshot: medicine.name,
            medicineImageSnapshot: primaryImage?.imageUrl || null,

            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(unitPrice),
            totalPrice: new Prisma.Decimal(unitPrice * item.quantity),
          },
        });

        // stock decrement
        await tx.medicine.update({
          where: { id: medicine.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // clear cart
    await tx.cartItem.deleteMany({
      where: {
        userId: customerId,
        medicineId: { in: medicineIds },
      },
    });

    // fetch and return the created order with vendor orders and items
    return tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        vendorOrders: {
          include: {
            orderItems: true,
            seller: true,
          },
        },
      },
    });
  });
};

const getMyOrders = async (customerId: string) => {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      vendorOrders: {
        include: {
          orderItems: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getOrderById = async (orderId: string, user: any) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      vendorOrders: {
        include: {
          orderItems: true,
          seller: true,
        },
      },
    },
  });

  // authorization check
  if (user.role === "CUSTOMER" && order.customerId !== user.id) {
    throw new Error("You are not allowed to access this order");
  }

  // if user is seller, check if any of the vendor orders belong to the seller
  if (user.role === "SELLER") {
    const hasVendorOrder = order.vendorOrders.some(
      (v) => v.sellerId === user.id,
    );

    if (!hasVendorOrder) {
      throw new Error("You are not allowed to access this order", {
        cause: {
          name: "UnauthorizedAccessError",
          message: `Seller with ID ${user.id} attempted to access order ${orderId} without authorization`,
          orderId,
          sellerId: user.id,
        },
      });
    }
  }

  return order;
};

const updateOrderStatus = async (
  orderId: string,
  sellerId: string,
  newStatus: OrderStatus,
) => {
  // validate vendor order belongs to the seller
  const vendorOrder = await prisma.vendorOrder.findFirstOrThrow({
    where: {
      orderId,
      sellerId,
    },
  });

  // validate if the new status is different from the current status
  if (vendorOrder.orderStatus === newStatus) {
    throw new Error(
      `Order is already in ${newStatus} status. No update needed.`,
      {
        cause: {
          name: "SameStatusUpdateError",
          message: `Attempted to update order status to the same status: ${newStatus}`,
          orderId,
        },
      },
    );
  }

  // validate status transition
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PLACED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  if (!validTransitions[vendorOrder.orderStatus].includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${vendorOrder.orderStatus} to ${newStatus}`,
      {
        cause: {
          name: "InvalidStatusTransitionError",
          message: `Cannot transition order status from ${vendorOrder.orderStatus} to ${newStatus}`,
          orderId,
          currentStatus: vendorOrder.orderStatus,
        },
      },
    );
  }

  // update status
  return prisma.vendorOrder.update({
    where: { id: vendorOrder.id },
    data: { orderStatus: newStatus },
  });
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
