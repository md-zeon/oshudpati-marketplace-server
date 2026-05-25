export const generateSlug = (...inputs: string[]): string => {
  const slugBase = inputs.join(" ");
  const slug = slugBase
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 1. Strip symbols (leaves spaces behind)
    .trim() // 2. Clear out any trailing/leading whitespace
    .replace(/\s+/g, "-") // 3. Convert all spaces (single or multiple) to a hyphen
    .replace(/-+/g, "-"); // 4. Collapse consecutive hyphens ("--" becomes "-")
  return slug;
};

export const parsePaginationParams = (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
  return { page, limit, skip, sortBy, sortOrder };
};
