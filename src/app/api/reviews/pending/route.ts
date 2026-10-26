import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { reviewInclude, toReview } from "@/lib/reviews";
import { handle, ok } from "@/lib/api-route";

export const GET = handle(async () => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const rows = await prisma.review.findMany({
    where: { approved: false },
    include: reviewInclude,
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return ok(rows.map(toReview));
});
