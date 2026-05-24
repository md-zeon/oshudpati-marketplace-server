import { prisma } from "../../lib/prisma";

const getAllCategories = async () => {};

interface CategoryData {
  name: string;
  description?: string;
  imageUrl?: string;
}

const createCategory = async (data: CategoryData) => {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 1. Strip symbols (leaves spaces behind)
    .trim() // 2. Clear out any trailing/leading whitespace
    .replace(/\s+/g, "-") // 3. Convert all spaces (single or multiple) to a hyphen
    .replace(/-+/g, "-"); // 4. Collapse consecutive hyphens ("--" becomes "-")

  console.log("Category name:", data.name);
  console.log("Generated slug:", slug);
  const newCategory = {
    name: data.name,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    slug,
  };

  const res = await prisma.category.create({
    data: newCategory,
  });

  console.log("Created category:", res);
  return res;
};

export const CategoryService = {
  getAllCategories,
  createCategory,
};
