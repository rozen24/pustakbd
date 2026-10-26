import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { fail, handle, isUuid, ok } from "@/lib/api-route";

export const PUT = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in", 401);
  const { id } = await params;
  if (!isUuid(id)) return fail("Notification not found", 404);
  await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  return ok({ ok: true });
});
