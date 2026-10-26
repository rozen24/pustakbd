import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, toProfile, userInclude } from "@/lib/auth";
import { requireRole } from "@/lib/guards";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

const ROLES = ["CUSTOMER", "EDITOR", "SELLER", "ADMIN"] as const;
type Role = (typeof ROLES)[number];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "seller";

export const GET = handle(async () => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const users = await prisma.user.findMany({ include: userInclude, orderBy: { createdAt: "desc" }, take: 500 });
  return ok(users.map(toProfile));
});

export const POST = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  const body = await readJson(request);

  const name = str(body.name, 100);
  const email = str(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const role = str(body.role, 20).toUpperCase() as Role;
  if (!name) return fail("Please enter a name", 400);
  if (!EMAIL.test(email)) return fail("Please enter a valid email address", 400);
  if (password.length < 8) return fail("Password must be at least 8 characters", 400);
  if (!ROLES.includes(role)) return fail("Invalid role", 400);

  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) return fail("An account with this email already exists", 409);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      ...(role === "SELLER"
        ? { seller: { create: { name, slug: `${slugify(name)}-${randomBytes(3).toString("hex")}` } } }
        : {}),
    },
    include: userInclude,
  });
  return ok(toProfile(user), { status: 201 });
});
