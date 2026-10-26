import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { sectionInclude, slugFor, toItem, toSection } from "@/lib/home-sections";
import { fail, handle, isUuid, ok, readJson, str } from "@/lib/api-route";

export const GET = handle(async () => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const rows = await prisma.homepageSection.findMany({
    where: { displayType: "COLLECTION" },
    include: sectionInclude,
    orderBy: { displayOrder: "asc" },
  });
  return ok(rows.map((s) => ({ ...toSection(s), items: s.items.map(toItem) })));
});

export const POST = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const b = await readJson(request);

  const title = str(b.title, 120);
  const categoryId = str(b.category_id, 40);
  if (!title) return fail("Please enter a section title", 400);
  if (!isUuid(categoryId)) return fail("Please choose a category", 400);
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) return fail("Category not found", 400);

  const last = await prisma.homepageSection.aggregate({
    where: { displayType: "COLLECTION" },
    _max: { displayOrder: true },
  });
  const displayOrder = Number.isInteger(b.display_order) ? (b.display_order as number) : (last._max.displayOrder ?? -1) + 1;

  const row = await prisma.homepageSection.create({
    data: {
      title,
      slug: slugFor(title),
      displayType: "COLLECTION",
      categoryId,
      displayOrder,
      active: b.is_active !== false,
    },
  });
  return ok(toSection(row), { status: 201 });
});
