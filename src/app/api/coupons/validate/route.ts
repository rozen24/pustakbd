import { evaluateCoupon } from "@/lib/coupons";
import { handle, ok, readJson, str } from "@/lib/api-route";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);
  const subtotal = Number(body.subtotal);
  const result = await evaluateCoupon(str(body.code, 60), Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0);
  return ok({ ok: result.ok, discount: result.discount, message: result.message });
});
