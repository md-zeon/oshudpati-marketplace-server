import { prisma } from "../../lib/prisma";

const createAddress = async (userId: string, payload: any) => {
  const { isDefault, ...data } = payload;

  return prisma.$transaction(async (tx) => {
    // Count existing addresses for the user to determine if the new address should be default
    const existingAddressCount = await tx.address.count({
      where: { userId },
    });

    //
    const shouldBeDefault = isDefault || existingAddressCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        ...data,
        isDefault: shouldBeDefault,
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
  const address = await prisma.address.findFirstOrThrow({
    where: { id: addressId, userId },
  });

  await prisma.address.delete({
    where: { id: addressId },
  });

  // If the deleted address was default, set another address as default
  if (address.isDefault) {
    const anotherAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (anotherAddress) {
      await prisma.address.update({
        where: { id: anotherAddress.id },
        data: { isDefault: true },
      });
    }
  }

  return null;
};

const setDefaultAddress = async (userId: string, addressId: string) => {
  return prisma.$transaction(async (tx) => {
    // Ensure the address belongs to the user and exists
    const address = await tx.address.findFirstOrThrow({
      where: {
        id: addressId,
        userId,
      },
    });

    // Unset previous default addresses for the user
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set the specified address as default
    return tx.address.update({
      where: { id: address.id },
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
