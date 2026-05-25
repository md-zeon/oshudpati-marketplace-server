import { AccountStatus, UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { parsePaginationParams } from "../../lib/utils";

const getAllUsers = async (query: Record<string, any>) => {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query);

  const { role, accountStatus, search } = query;

  const whereConditions: any = {};

  // Role filter
  if (role && Object.values(UserRole).includes(role)) {
    whereConditions.role = role;
  }

  // Account status filter
  if (accountStatus && Object.values(AccountStatus).includes(accountStatus)) {
    whereConditions.accountStatus = accountStatus;
  }

  // Search by name/email
  if (search) {
    whereConditions.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, total] = await Promise.all([
    // Fetch users with pagination and sorting
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        image: true,
        phoneNumber: true,
        shopName: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    // Count total users matching the filters
    prisma.user.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: users,
  };
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
