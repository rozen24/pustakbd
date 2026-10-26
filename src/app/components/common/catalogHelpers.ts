import type { Category } from "../../../types";

/** Find a category whose slug or name matches any keyword (case-insensitive). Top-level preferred. */
export function findCategory(categories: Category[], keywords: string[]): Category | undefined {
  const ks = keywords.map((k) => k.toLowerCase());
  const match = (c: Category) => ks.some((k) => c.slug.toLowerCase().includes(k) || c.name.toLowerCase().includes(k));
  return categories.find((c) => !c.parentId && match(c)) ?? categories.find(match);
}

export const ACADEMIC_KEYS = ["academic", "admission", "education", "textbook"];
export const ISLAMIC_KEYS = ["islam", "religio"];
