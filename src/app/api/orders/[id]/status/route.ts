import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { orderInclude, toOrder } from "@/lib/mappers";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];
const isOpen = (s: string) => s !== "CANCELLED" && s !== "DELIVERED";

export const PUT = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await readJson(request);
  const next = str(body.status, 30).toUpperCase() as Status;
  const note = str(body.note, 300) || null;
  if (!STATUSES.includes(next)) return fail("Invalid status", 400);

  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) return fail("Order not found", 404);

  const updated = await prisma.$transaction(async (tx) => {
    // Cancelling frees reserved stock; delivering turns the reservation into a real sale.
    if (isOpen(order.status) && (next === "CANCELLED" || next === "DELIVERED")) {
      for (const item of order.items) {
        if (next === "CANCELLED") {
          await tx.$executeRaw`UPDATE "Inventory" SET "reserved" = GREATEST("reserved" - ${item.quantity}::int, 0)
            WHERE "productId" = ${item.productId}::uuid`;
        } else {
          await tx.$executeRaw`UPDATE "Inventory"
            SET "reserved" = GREATEST("reserved" - ${item.quantity}::int, 0),
                "quantity" = GREATEST("quantity" - ${item.quantity}::int, 0)
            WHERE "productId" = ${item.productId}::uuid`;
        }
      }
    }
    const markPaid = next === "DELIVERED" && order.paymentMethod === "COD" && !!order.payment;
    const result = await tx.order.update({
      where: { id },
      data: {
        status: next,
        timeline: { create: { status: next, note } },
        ...(markPaid ? { payment: { update: { status: "PAID" } } } : {}),
      },
      include: orderInclude,
    });
    if (order.userId) {
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Order update",
          body: `Order #${id.slice(-8).toUpperCase()} is now ${next.toLowerCase().replace(/_/g, " ")}.`,
        },
      });
    }
    return result;
  });
  return ok(toOrder(updated));
});
