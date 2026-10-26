import { requireRole } from "@/lib/guards";
import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, isUuid, ok } from "@/lib/api-route";

export const GET = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!isUuid(id)) return ok([]);
  return ok(await prismaRepositories.deals.products(id));
});
