import { prisma } from "../../lib/prisma";

const createAddress = async (userId: string, payload: any) => {
  const { isDefault, ...data } = payload;

  return prisma.$transaction(async (tx) => {
    // if new address is default → unset previous defaults
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        ...data,
        isDefault: isDefault || false,
      },
    });
  });
};

const getMyAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const updateAddress = async (
  userId: string,
  addressId: string,
  payload: any,
) => {
  const { isDefault, ...data } = payload;

  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirstOrThrow({
      where: { id: addressId, userId },
    });

    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: address.id },
      data: {
        ...data,
        ...(isDefault !== undefined && { isDefault }),
      },
    });
  });
};

const deleteAddress = async (userId: string, addressId: string) => {
  await prisma.address.findFirstOrThrow({
    where: { id: addressId, userId },
  });

  return prisma.address.delete({
    where: { id: addressId },
  });
};

const setDefaultAddress = async (userId: string, addressId: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });
};

export const AddressService = {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
