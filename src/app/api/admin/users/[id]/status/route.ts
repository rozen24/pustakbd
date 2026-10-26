import { prisma } from "@/lib/prisma";
import { toProfile, userInclude } from "@/lib/auth";
import { requireRole } from "@/lib/guards";
import { fail, handle, isUuid, ok, readJson, str } from "@/lib/api-route";

export const PUT = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!isUuid(id)) return fail("User not found", 404);
  const status = str((await readJson(request)).status, 20).toUpperCase();
  if (status !== "ACTIVE" && status !== "SUSPENDED") return fail("Invalid status", 400);
  if (id === auth.user.id && status === "SUSPENDED") return fail("You can't suspend your own account", 400);

  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return fail("User not found", 404);

  const [updated] = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { status }, include: userInclude }),
    // Suspending signs the user out everywhere straight away.
    ...(status === "SUSPENDED" ? [prisma.session.deleteMany({ where: { userId: id } })] : []),
  ]);
  return ok(toProfile(updated));
});
