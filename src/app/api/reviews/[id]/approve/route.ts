import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { recomputeRating } from "@/lib/reviews";
import { fail, handle, isUuid, ok, readJson } from "@/lib/api-route";

export const PUT = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!isUuid(id)) return fail("Review not found", 404);
  const { approved } = await readJson(request);
  if (typeof approved !== "boolean") return fail("Invalid request", 400);

  const review = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
  if (!review) return fail("Review not found", 404);
  await prisma.review.update({ where: { id }, data: { approved } });
  await recomputeRating(review.productId);
  return ok({ ok: true });
});
