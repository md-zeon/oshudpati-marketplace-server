import { prisma } from "../../lib/prisma";

const getCustomerDashboard = async (customerId: string) => {
  const [orders, addresses, cartSummary] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      include: {
        vendorOrders: {
          include: {
            orderItems: {
              include: {
                medicine: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    discountPrice: true,
                    images: {
                      take: 1,
                      where: { isPrimary: true },
                      select: { imageUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    prisma.address.findMany({
      where: { userId: customerId },
      orderBy: { isDefault: "desc" },
    }),

    prisma.cartItem.aggregate({
      where: { userId: customerId },
      _sum: { quantity: true },
    }),
  ]);

  // Calculate stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    o.vendorOrders.some(
      (vo) => vo.orderStatus !== "DELIVERED" && vo.orderStatus !== "CANCELLED",
    ),
  ).length;

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const totalSavings = orders.reduce((sum, o) => {
    const orderSavings = o.vendorOrders.reduce((vendorSum, vo) => {
      const itemSavings = vo.orderItems.reduce((itemSum, item) => {
        const medicinePrice = item.medicine?.price
          ? Number(item.medicine.price)
          : Number(item.unitPrice);
        const discountPrice = item.medicine?.discountPrice
          ? Number(item.medicine.discountPrice)
          : Number(item.unitPrice);
        return itemSum + (medicinePrice - discountPrice) * item.quantity;
      }, 0);
      return vendorSum + itemSavings;
    }, 0);
    return sum + orderSavings;
  }, 0);

  // Get recent unique medicines for quick reorder
  const recentMedicineIds = new Set<string>();
  const quickReorder: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    image: string | null;
  }[] = [];

  for (const order of orders) {
    for (const vendor of order.vendorOrders) {
      for (const item of vendor.orderItems) {
        if (
          item.medicine &&
          !recentMedicineIds.has(item.medicine.id) &&
          quickReorder.length < 6
        ) {
          recentMedicineIds.add(item.medicine.id);
          quickReorder.push({
            id: item.medicine.id,
            name: item.medicine.name,
            slug: item.medicine.slug,
            price: Number(item.medicine.price),
            discountPrice: item.medicine.discountPrice
              ? Number(item.medicine.discountPrice)
              : null,
            image: item.medicine.images?.[0]?.imageUrl || null,
          });
        }
      }
    }
  }

  // Transform orders for the client
  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount),
    subtotalAmount: Number(order.subtotalAmount),
    deliveryFee: Number(order.deliveryFee),
    paymentStatus: order.paymentStatus,
    placedAt: order.placedAt,
    createdAt: order.createdAt,
    vendorOrders: order.vendorOrders.map((vo) => ({
      id: vo.id,
      sellerId: vo.sellerId,
      orderStatus: vo.orderStatus,
      vendorSubtotal: Number(vo.vendorSubtotal),
      orderItems: vo.orderItems.map((oi) => ({
        id: oi.id,
        medicineId: oi.medicineId,
        medicineNameSnapshot: oi.medicineNameSnapshot,
        medicineImageSnapshot: oi.medicineImageSnapshot,
        quantity: oi.quantity,
        unitPrice: Number(oi.unitPrice),
        totalPrice: Number(oi.totalPrice),
      })),
    })),
  }));

  const defaultAddress =
    addresses.find((a) => a.isDefault) || addresses[0] || null;

  return {
    stats: {
      totalOrders,
      activeOrders,
      totalSpent,
      totalSavings,
      savedAddresses: addresses.length,
      cartItemCount: cartSummary._sum.quantity || 0,
    },
    recentOrders,
    quickReorder,
    defaultAddress: defaultAddress
      ? {
          id: defaultAddress.id,
          fullName: defaultAddress.fullName,
          phoneNumber: defaultAddress.phoneNumber,
          division: defaultAddress.division,
          district: defaultAddress.district,
          area: defaultAddress.area,
          streetAddress: defaultAddress.streetAddress,
          addressLabel: defaultAddress.addressLabel,
          isDefault: defaultAddress.isDefault,
        }
      : null,
  };
};

export const DashboardService = {
  getCustomerDashboard,
};
