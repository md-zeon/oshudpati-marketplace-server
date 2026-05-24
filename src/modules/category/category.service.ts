import { prisma } from "../../lib/prisma";
import { generateSlug } from "../../lib/utils";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUniqueOrThrow({
    where: { id },
  });

  return category;
};

interface CategoryData {
  name: string;
  description?: string;
  imageUrl?: string;
}

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
  });

  return res;
};

const updateCategory = async (
  id: string,
  data: Partial<CategoryData> & { slug?: string },
) => {
  const res = await prisma.category.update({
    where: { id },
    data,
  });

  return res;
};

export const CategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategoryById,
};
