import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { toProfile, userInclude } from "@/lib/auth";
import { requireRole } from "@/lib/guards";
import { fail, handle, isUuid, ok, readJson, str } from "@/lib/api-route";

const ROLES = ["CUSTOMER", "EDITOR", "SELLER", "ADMIN"] as const;
type Role = (typeof ROLES)[number];
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "seller";

export const PUT = handle(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!isUuid(id)) return fail("User not found", 404);
  const role = str((await readJson(request)).role, 20).toUpperCase() as Role;
  if (!ROLES.includes(role)) return fail("Invalid role", 400);
  if (id === auth.user.id && role !== "ADMIN") return fail("You can't remove your own admin access", 400);

  const target = await prisma.user.findUnique({ where: { id }, include: { seller: true } });
  if (!target) return fail("User not found", 404);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role,
      // A seller account needs a seller profile; create one if it is missing.
      ...(role === "SELLER" && !target.seller
        ? { seller: { create: { name: target.name, slug: `${slugify(target.name)}-${randomBytes(3).toString("hex")}` } } }
        : {}),
    },
    include: userInclude,
  });
  return ok(toProfile(updated));
});
