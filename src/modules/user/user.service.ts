import { AccountStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({});

  return users;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  return user;
};

const updateUserAccountStatus = async (
  id: string,
  accountStatus: AccountStatus,
) => {
  return await prisma.user.update({
    where: { id },
    data: { accountStatus },
  });
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUserAccountStatus,
};
