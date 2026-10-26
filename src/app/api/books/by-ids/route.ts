import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, isUuid, ok } from "@/lib/api-route";

export const GET = handle(async (request: Request) => {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  // Ignore stale ids (e.g. cart items saved before the move to PostgreSQL).
  const ids = raw.split(",").map((s) => s.trim()).filter(isUuid).slice(0, 50);
  return ok(ids.length ? await prismaRepositories.books.getMany(ids) : []);
});
