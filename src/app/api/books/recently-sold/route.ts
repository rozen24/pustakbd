import { prisma } from "@/lib/prisma";
import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, ok } from "@/lib/api-route";

export const GET = handle(async () => {
  const rows = await prisma.orderItem.findMany({
    orderBy: { order: { createdAt: "desc" } },
    distinct: ["productId"],
    select: { productId: true },
    take: 10,
  });
  const ids = rows.map((r) => r.productId);
  return ok(ids.length ? await prismaRepositories.books.getMany(ids) : []);
});
