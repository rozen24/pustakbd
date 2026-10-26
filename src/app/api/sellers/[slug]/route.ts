import { prismaRepositories } from "@/services/prisma-repositories";
import { fail, handle, ok } from "@/lib/api-route";

export const GET = handle(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const item = await prismaRepositories.catalog.sellerBySlug(slug);
  return item ? ok(item) : fail("Seller not found", 404);
});
