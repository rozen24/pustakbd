import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireRole } from "@/lib/guards";
import { evaluateCoupon } from "@/lib/coupons";
import { getShippingRules } from "@/lib/settings";
import { OUTSIDE_SHIPPING } from "@/lib/constants";
import { orderInclude, toOrder } from "@/lib/mappers";
import { prismaRepositories } from "@/services/prisma-repositories";
import { fail, handle, isUuid, ok, readJson, str } from "@/lib/api-route";

class OrderError extends Error {}

const METHODS = {
  cod: "COD", bkash: "BKASH", nagad: "NAGAD", rocket: "ROCKET", sslcommerz: "SSLCOMMERZ", stripe: "STRIPE",
} as const;

// Admin: all orders, newest first.
export const GET = handle(async () => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const orders = await prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: "desc" }, take: 200 });
  return ok(orders.map(toOrder));
});

// Place an order. Prices, shipping, coupon discount and totals are all computed
// here from the database. Anything the browser sends for those is ignored.
export const POST = handle(async (request: Request) => {
  const user = await getSessionUser(); // optional: guests can check out too
  const body = await readJson(request);

  // 1. Validate and merge cart lines
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return fail("Your cart is empty", 400);
  }
  const wanted = new Map<string, number>();
  for (const raw of body.items as Record<string, unknown>[]) {
    const bookId = str(raw?.bookId, 40);
    const qty = Number(raw?.quantity);
    if (!isUuid(bookId) || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return fail("Some items in your cart are invalid. Please refresh your cart.", 400);
    }
    wanted.set(bookId, (wanted.get(bookId) ?? 0) + qty);
  }

  const methodKey = str(body.paymentMethod, 20).toLowerCase() as keyof typeof METHODS;
  const paymentMethod = METHODS[methodKey];
  if (!paymentMethod) return fail("Please choose a payment method", 400);

  const a = (body.address ?? {}) as Record<string, unknown>;
  const address = {
    fullName: str(a.fullName, 100),
    phone: str(a.phone, 30),
    district: str(a.district, 60),
    area: str(a.area, 100),
    street: str(a.street, 200),
  };
  if (!address.fullName || !address.phone || !address.district || !address.area || !address.street) {
    return fail("Please fill in all delivery details", 400);
  }

  // 2. Price everything from the database
  const books = await prismaRepositories.books.getMany([...wanted.keys()]);
  const byId = new Map(books.map((b) => [b.id, b]));
  const lines = [...wanted.entries()].map(([id, qty]) => ({ book: byId.get(id), qty }));
  if (lines.some((l) => !l.book || l.book.status !== "published")) {
    return fail("Some books in your cart are no longer available", 409);
  }
  const priced = lines.map((l) => ({ book: l.book!, qty: l.qty, price: l.book!.flashSale?.price ?? l.book!.price }));
  const subtotal = priced.reduce((s, l) => s + l.price * l.qty, 0);

  const { freeShippingThreshold, shippingFee } = await getShippingRules();
  const shipping =
  subtotal >= freeShippingThreshold ? 0 : address.district === "Dhaka" ? shippingFee : OUTSIDE_SHIPPING;
  let discount = 0;
  let couponCode: string | null = null;
  const couponInput = str(body.couponCode, 60);
  if (couponInput) {
    const result = await evaluateCoupon(couponInput, subtotal);
    if (!result.ok) return fail(result.message, 400);
    discount = result.discount;
    couponCode = result.code ?? null;
  }
  const total = Math.max(0, subtotal - discount) + shipping;

  // 3. Reserve stock and create the order in one transaction
  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const l of priced) {
        const updated = await tx.$executeRaw`
          UPDATE "Inventory" SET "reserved" = "reserved" + ${l.qty}::int
          WHERE "productId" = ${l.book.id}::uuid AND "quantity" - "reserved" >= ${l.qty}::int`;
        if (updated === 0) throw new OrderError(`"${l.book.title}" does not have enough stock`);
      }
      const created = await tx.order.create({
        data: {
          userId: user?.id ?? null,
          status: "PENDING",
          subtotal,
          shipping,
          discount,
          total,
          couponCode,
          paymentMethod,
          shippingAddress: address,
          items: {
            create: priced.map((l) => ({
              productId: l.book.id,
              title: l.book.title,
              coverUrl: l.book.coverUrl || null,
              price: l.price,
              quantity: l.qty,
            })),
          },
          payment: { create: { amount: total } },
          timeline: { create: [{ status: "PENDING", note: "Order placed" }] },
        },
        include: orderInclude,
      });
      if (user) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: "Order placed",
            body: `We received your order #${created.id.slice(-8).toUpperCase()}.`,
          },
        });
      }
      return created;
    });
    return ok(toOrder(order), { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) return fail(err.message, 409);
    throw err;
  }
});
