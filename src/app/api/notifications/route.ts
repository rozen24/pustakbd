import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { toNotification } from "@/lib/mappers";
import { handle, ok } from "@/lib/api-route";

export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return ok([]);
  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return ok(rows.map(toNotification));
});
