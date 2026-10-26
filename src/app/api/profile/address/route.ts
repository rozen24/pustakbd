import { prisma } from "@/lib/prisma";
import { getSessionUser, toProfile, userInclude } from "@/lib/auth";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const POST = handle(async (request: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in", 401);
  const b = await readJson(request);

  const fullName = str(b.fullName, 100);
  const phone = str(b.phone, 30);
  const district = str(b.district, 60);
  const area = str(b.area, 100);
  const street = str(b.street, 200);
  if (!fullName || !phone || !district || !area || !street) return fail("Please fill in all address fields", 400);
  const label = str(b.label, 30) || "Home";
  const isDefault = b.isDefault === true || user.addresses.length === 0;

  const updated = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    await tx.address.create({ data: { userId: user.id, label, fullName, phone, district, area, street, isDefault } });
    return tx.user.findUniqueOrThrow({ where: { id: user.id }, include: userInclude });
  });
  return ok(toProfile(updated));
});
