import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { orderInclude, toOrder } from "@/lib/mappers";
import { fail, handle, ok } from "@/lib/api-route";

export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in", 401);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok(orders.map(toOrder));
});
