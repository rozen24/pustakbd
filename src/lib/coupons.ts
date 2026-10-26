import { prisma } from "@/lib/prisma";

export type CouponResult = { ok: boolean; discount: number; message: string; code?: string };

// The single source of truth for coupon rules. Used by the validate endpoint
// and again when an order is placed, so the browser can never set its own discount.
export async function evaluateCoupon(rawCode: string, subtotal: number): Promise<CouponResult> {
  const code = rawCode.trim();
  if (!code) return { ok: false, discount: 0, message: "Enter a coupon code" };

  const coupon = await prisma.coupon.findFirst({ where: { code: { equals: code, mode: "insensitive" } } });
  if (!coupon || !coupon.active) return { ok: false, discount: 0, message: "Invalid coupon code" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, discount: 0, message: "This coupon has expired" };
  }
  const minSpend = Number(coupon.minSpend);
  if (subtotal < minSpend) {
    return { ok: false, discount: 0, message: `Spend at least Tk ${minSpend} to use this coupon` };
  }
  const value = Number(coupon.value);
  const raw = coupon.type === "PERCENT" ? (subtotal * value) / 100 : value;
  const discount = Math.max(0, Math.min(subtotal, Math.round(raw)));
  return { ok: true, discount, message: `Coupon ${coupon.code} applied`, code: coupon.code };
}
