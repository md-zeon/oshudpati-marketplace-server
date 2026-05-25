import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/utils";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      medicines: true,
    },
  },
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: categorySelect,
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findFirstOrThrow({
    where: { id, isActive: true },
    select: categorySelect,
  });

  return category;
};

interface CategoryData {
  name: string;
  description?: string;
  imageUrl?: string;
}

const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findFirstOrThrow({
    where: {
      slug,
      isActive: true,
    },

    select: categorySelect,
  });

  return category;
};

const createCategory = async (data: CategoryData) => {
  const slug = generateSlug(data.name);

  const newCategory = {
    name: data.name,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    slug,
  };

  const res = await prisma.category.create({
    data: newCategory,
    select: categorySelect,
  });

  return res;
};

const updateCategory = async (
  id: string,
  data: Partial<CategoryData> & { slug?: string },
) => {
  const updateData: any = {
    ...data,
  };

  // Auto regenerate slug if name changes and slug not manually provided
  if (data.name && !data.slug) {
    updateData.slug = generateSlug(data.name);
  }

  const res = await prisma.category.update({
    where: { id },
    data: updateData,
    select: categorySelect,
  });

  return res;
};

export const CategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategoryById,
  getCategoryBySlug,
};
