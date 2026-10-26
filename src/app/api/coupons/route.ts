import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { toCoupon } from "@/lib/mappers";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const GET = handle(async () => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return ok(rows.map(toCoupon));
});

export const POST = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const b = await readJson(request);

  const code = str(b.code, 40).toUpperCase().replace(/\s+/g, "");
  const type = str(b.type, 10).toUpperCase();
  const value = Number(b.value);
  const minSpend = Number(b.minSpend ?? 0);
  if (!code) return fail("Coupon code is required", 400);
  if (type !== "PERCENT" && type !== "FLAT") return fail("Coupon type must be percent or flat", 400);
  if (!Number.isFinite(value) || value <= 0 || (type === "PERCENT" && value > 100)) {
    return fail("Enter a valid discount value", 400);
  }
  if (!Number.isFinite(minSpend) || minSpend < 0) return fail("Enter a valid minimum spend", 400);
  const expiresAt = b.expiresAt ? new Date(String(b.expiresAt)) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return fail("Enter a valid expiry date", 400);

  const exists = await prisma.coupon.findFirst({ where: { code: { equals: code, mode: "insensitive" } } });
  if (exists) return fail("A coupon with this code already exists", 409);

  const row = await prisma.coupon.create({
    data: { code, type, value, minSpend, active: b.active !== false, expiresAt },
  });
  return ok(toCoupon(row), { status: 201 });
});
