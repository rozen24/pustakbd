import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { toItem } from "@/lib/home-sections";
import { fail, handle, isUuid, ok, readJson } from "@/lib/api-route";

// Replaces the section's product list with the given ids, in the given order.
export const PUT = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!isUuid(id)) return fail("Section not found", 404);
  const { productIds } = await readJson(request);
  if (!Array.isArray(productIds) || productIds.length > 50 || !productIds.every((v) => typeof v === "string" && isUuid(v))) {
    return fail("Invalid product list", 400);
  }

  const section = await prisma.homepageSection.findUnique({ where: { id }, select: { id: true } });
  if (!section) return fail("Section not found", 404);

  const wanted = [...new Set(productIds as string[])];
  const found = await prisma.product.findMany({ where: { id: { in: wanted } }, select: { id: true } });
  const valid = new Set(found.map((p) => p.id));
  const ordered = wanted.filter((pid) => valid.has(pid));

  await prisma.$transaction([
    prisma.homepageSectionItem.deleteMany({ where: { sectionId: id } }),
    prisma.homepageSectionItem.createMany({
      data: ordered.map((productId, index) => ({ sectionId: id, productId, displayOrder: index })),
    }),
  ]);
  const items = await prisma.homepageSectionItem.findMany({ where: { sectionId: id }, orderBy: { displayOrder: "asc" } });
  return ok(items.map(toItem));
});
