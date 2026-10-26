import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, toProfile, userInclude } from "@/lib/auth";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "seller";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);
  const name = str(body.name, 100);
  const email = str(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  // Only "customer" and "seller" can be chosen at sign-up. Admin and editor
  // roles are never granted from the public form.
  const wantsSeller = body.role === "seller";

  if (!name) return fail("Please enter your name", 400);
  if (!EMAIL.test(email)) return fail("Please enter a valid email address", 400);
  if (password.length < 8) return fail("Password must be at least 8 characters", 400);

  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) return fail("An account with this email already exists", 409);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: wantsSeller ? "SELLER" : "CUSTOMER",
        ...(wantsSeller
          ? { seller: { create: { name, slug: `${slugify(name)}-${randomBytes(3).toString("hex")}` } } }
          : {}),
      },
      include: userInclude,
    });
    await createSession(user.id);
    return ok(toProfile(user), { status: 201 });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") return fail("An account with this email already exists", 409);
    throw err;
  }
});
