import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, ok } from "@/lib/api-route";

export const GET = handle(async (request: Request) => {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return ok({ books: [], authors: [], categories: [], publishers: [] });
  return ok(await prismaRepositories.search.suggest(q));
});
