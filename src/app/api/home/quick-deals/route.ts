import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, ok } from "@/lib/api-route";

export const GET = handle(async (request: Request) => {
  const n = Number(new URL(request.url).searchParams.get("limit"));
  const limit = Number.isFinite(n) && n > 0 ? Math.min(50, n) : 12;
  return ok(await prismaRepositories.deals.quickDeals(limit));
});
