import { prisma } from "../../lib/prisma";

const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phoneNumber: true,
      shopName: true,
      emailVerified: true,
      accountStatus: true,
      createdAt: true,
    },
  });

  return user;
};

export const AuthService = {
  getCurrentUser,
};
