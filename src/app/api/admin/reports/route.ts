import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { handle, ok } from "@/lib/api-route";
import type { AdminReport } from "@/types";

const DAYS = 30;
const LOW_STOCK_AT = 5; // a book with 1 to 5 copies available counts as "low stock"
const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;

// Calendar dates are shown in Bangladesh time, so "today" ends at local midnight.
const dhakaDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(d);

// Revenue figures exclude cancelled orders.
export const GET = handle(async () => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;

  const since = new Date(Date.now() - (DAYS + 1) * 86_400_000);

  const [totals, stock, statusRows, dailyRows, topBooks, topSellers, subscriberRows] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ books: number; out: number; low: number }[]>`
      SELECT
        COUNT(*)::int AS "books",
        COUNT(*) FILTER (WHERE COALESCE(i."quantity" - i."reserved", 0) <= 0)::int AS "out",
        COUNT(*) FILTER (WHERE COALESCE(i."quantity" - i."reserved", 0) BETWEEN 1 AND ${LOW_STOCK_AT})::int AS "low"
      FROM "Product" p
      LEFT JOIN "Inventory" i ON i."productId" = p."id"
      WHERE p."status" = 'PUBLISHED'`,
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.$queryRaw<{ date: string; revenue: number; orders: number }[]>`
      SELECT
        to_char(((o."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Dhaka')::date, 'YYYY-MM-DD') AS "date",
        SUM(o."total")::float8 AS "revenue",
        COUNT(*)::int AS "orders"
      FROM "Order" o
      WHERE o."status" <> 'CANCELLED' AND o."createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1`,
    prisma.$queryRaw<{ bookId: string; title: string; units: number; revenue: number }[]>`
      SELECT
        oi."productId" AS "bookId",
        MAX(oi."title") AS "title",
        SUM(oi."quantity")::int AS "units",
        SUM(oi."price" * oi."quantity")::float8 AS "revenue"
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      WHERE o."status" <> 'CANCELLED'
      GROUP BY oi."productId"
      ORDER BY "revenue" DESC
      LIMIT 10`,
    prisma.$queryRaw<{ id: string; name: string; revenue: number }[]>`
      SELECT
        s."id" AS "id",
        s."name" AS "name",
        SUM(oi."price" * oi."quantity")::float8 AS "revenue"
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      JOIN "Product" p ON p."id" = oi."productId"
      JOIN "Seller" s ON s."id" = p."sellerId"
      WHERE o."status" <> 'CANCELLED'
      GROUP BY s."id", s."name"
      ORDER BY "revenue" DESC
      LIMIT 10`,
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 1000, select: { email: true } }),
  ]);

  const revenue = Number(totals._sum.total ?? 0);
  const orders = totals._count._all;
  const s = stock[0] ?? { books: 0, out: 0, low: 0 };

  // One entry per day for the last 30 days, including days with no sales.
  const byDate = new Map(dailyRows.map((r) => [r.date, r]));
  const daily: AdminReport["daily"] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = dhakaDate(new Date(Date.now() - i * 86_400_000));
    const row = byDate.get(date);
    daily.push({ date, revenue: row ? Number(row.revenue) : 0, orders: row ? Number(row.orders) : 0 });
  }

  const byStatus: Record<string, number> = Object.fromEntries(STATUSES.map((st) => [st.toLowerCase(), 0]));
  for (const row of statusRows) byStatus[row.status.toLowerCase()] = row._count._all;

  const report: AdminReport = {
    totals: {
      revenue,
      orders,
      avgOrder: orders > 0 ? Math.round(revenue / orders) : 0,
      books: Number(s.books),
      lowStock: Number(s.low),
      outOfStock: Number(s.out),
      subscribers: subscriberRows.length,
    },
    daily,
    byStatus,
    topBooks: topBooks.map((b) => ({ bookId: b.bookId, title: b.title, units: Number(b.units), revenue: Number(b.revenue) })),
    topSellers: topSellers.map((x) => ({ id: x.id, name: x.name, revenue: Number(x.revenue) })),
    subscribers: subscriberRows.map((r) => r.email),
  };
  return ok(report);
});
