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

export const parsePaginationParams = (
  query: any,
): {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
} => {
  const page = isNaN(Number(query.page)) ? 1 : Number(query.page);
  const limit = isNaN(Number(query.limit)) ? 10 : Number(query.limit);
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
  return { page, limit, skip, sortBy, sortOrder };
};

export const generateOrderNumber = (): string => {
  return `ORD-${Date.now()}`;
};

export const calculateDeliveryFee = (subtotal: number): number => {
  if (subtotal >= 300) {
    return 0; // Free delivery for orders above or equal to 300 Taka
  }

  return 60;
};
