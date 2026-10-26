import { prismaRepositories } from "@/services/prisma-repositories";
import { fail, handle, isUuid, ok } from "@/lib/api-route";

export const GET = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!isUuid(id)) return fail("Book not found", 404);
  const book = await prismaRepositories.books.getById(id);
  return book ? ok(book) : fail("Book not found", 404);
});
