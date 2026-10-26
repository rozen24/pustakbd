import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { reviewInclude, toReview } from "@/lib/reviews";
import { fail, handle, ok } from "@/lib/api-route";

// The signed-in user's own reviews, including ones still waiting for approval.
export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in", 401);
  const rows = await prisma.review.findMany({
    where: { userId: user.id },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok(rows.map(toReview));
});
