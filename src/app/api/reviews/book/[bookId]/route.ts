import { prisma } from "@/lib/prisma";
import { reviewInclude, toReview } from "@/lib/reviews";
import { handle, isUuid, ok } from "@/lib/api-route";

// Public: only approved reviews, newest first.
export const GET = handle(async (_req: Request, { params }: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params;
  if (!isUuid(bookId)) return ok([]);
  const rows = await prisma.review.findMany({
    where: { productId: bookId, approved: true },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok(rows.map(toReview));
});
