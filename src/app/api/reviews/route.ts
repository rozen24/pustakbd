import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { reviewInclude, toReview } from "@/lib/reviews";
import { fail, handle, isUuid, ok, readJson, str } from "@/lib/api-route";

// A signed-in customer submits a review. It stays hidden until an admin or
// editor approves it.
export const POST = handle(async (request: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in to write a review", 401);
  const b = await readJson(request);

  const productId = str(b.bookId, 40);
  const rating = Number(b.rating);
  const title = str(b.title, 150);
  const body = str(b.body, 3000);
  if (!isUuid(productId)) return fail("Book not found", 404);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Please choose a rating from 1 to 5", 400);
  if (body.length < 3) return fail("Please write a few words about the book", 400);

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return fail("Book not found", 404);
  const already = await prisma.review.findUnique({ where: { productId_userId: { productId, userId: user.id } } });
  if (already) return fail("You have already reviewed this book", 409);

  const row = await prisma.review.create({
    data: { productId, userId: user.id, rating, title: title || null, body, approved: false },
    include: reviewInclude,
  });
  return ok(toReview(row), { status: 201 });
});
