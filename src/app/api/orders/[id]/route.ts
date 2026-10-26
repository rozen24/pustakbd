import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { orderInclude, toOrder } from "@/lib/mappers";
import { fail, handle, ok } from "@/lib/api-route";

export const GET = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) return fail("Order not found", 404);

  // Guest orders are viewable with their (unguessable) id, which is how the
  // confirmation page works. Orders that belong to an account are private.
  if (order.userId) {
    const user = await getSessionUser();
    let allowed = !!user && (user.id === order.userId || user.role === "ADMIN");
    if (!allowed && user?.role === "SELLER") {
      allowed = (await prisma.orderItem.count({ where: { orderId: id, product: { seller: { userId: user.id } } } })) > 0;
    }
    if (!allowed) return fail("Order not found", 404);
  }
  return ok(toOrder(order));
});
