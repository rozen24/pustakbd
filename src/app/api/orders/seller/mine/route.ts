import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { orderInclude, toOrder } from "@/lib/mappers";
import { handle, ok } from "@/lib/api-route";

// Orders that contain at least one of the signed-in seller's books.
export const GET = handle(async () => {
  const auth = await requireRole("SELLER", "ADMIN");
  if (auth.error) return auth.error;
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { seller: { userId: auth.user.id } } } } },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(orders.map(toOrder));
});
