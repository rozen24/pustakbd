import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { fail, handle, ok } from "@/lib/api-route";

export const DELETE = handle(async (_req: Request, { params }: { params: Promise<{ code: string }> }) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const { code } = await params;
  const row = await prisma.coupon.findFirst({ where: { code: { equals: decodeURIComponent(code), mode: "insensitive" } } });
  if (!row) return fail("Coupon not found", 404);
  await prisma.coupon.delete({ where: { code: row.code } });
  return ok({ ok: true });
});
