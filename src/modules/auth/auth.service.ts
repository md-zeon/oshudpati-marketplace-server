import { prisma } from "../../lib/prisma";

const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found", {
      cause: "User with the provided ID does not exist",
    });
  }

  return user;
};

export const AuthService = {
  getCurrentUser,
};
