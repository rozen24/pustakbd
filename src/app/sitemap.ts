import type { MetadataRoute } from "next";

const publicRoutes = [
  "/",
  "/books",
  "/authors",
  "/publishers",
  "/search",
  "/blog",
  "/cart",
  "/wishlist",
  "/compare",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
