import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, isUuid, ok } from "@/lib/api-route";

export const GET = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!isUuid(id)) return ok([]);
  const book = await prismaRepositories.books.getById(id);
  return ok(book ? await prismaRepositories.books.frequentlyBoughtTogether(book) : []);
});
