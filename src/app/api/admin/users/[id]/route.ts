import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { fail, handle, isUuid, ok } from "@/lib/api-route";

export const DELETE = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!isUuid(id)) return fail("User not found", 404);
  if (id === auth.user.id) return fail("You can't delete your own account", 400);
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return fail("User not found", 404);
  await prisma.user.delete({ where: { id } }); // sessions, addresses, reviews cascade; orders keep (userId set to null)
  return ok({ ok: true });
});
