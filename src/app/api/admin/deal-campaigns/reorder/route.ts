import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { fail, handle, isUuid, ok, readJson } from "@/lib/api-route";

export const PUT = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const { ids } = await readJson(request);
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100 || !ids.every((v) => typeof v === "string" && isUuid(v))) {
    return fail("Invalid order", 400);
  }
  await prisma.$transaction(
    (ids as string[]).map((id, index) => prisma.dealCampaign.updateMany({ where: { id }, data: { displayOrder: index } })),
  );
  return ok({ ok: true });
});
