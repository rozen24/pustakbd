import { prisma } from "@/lib/prisma";
import { hashPassword, sha256 } from "@/lib/auth";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);
  const token = str(body.token, 200);
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) return fail("Password must be at least 8 characters", 400);

  const invalid = () => fail("This reset link is invalid or has expired", 400);
  if (!token) return invalid();
  const row = await prisma.verificationToken.findUnique({ where: { token: sha256(token) } });
  if (!row || row.expires.getTime() < Date.now()) return invalid();
  const user = await prisma.user.findFirst({ where: { email: { equals: row.identifier, mode: "insensitive" } } });
  if (!user) return invalid();

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } }),
    prisma.session.deleteMany({ where: { userId: user.id } }), // sign out everywhere
    prisma.verificationToken.deleteMany({ where: { identifier: row.identifier } }),
  ]);
  return ok({ ok: true });
});
