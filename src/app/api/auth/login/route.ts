import { prisma } from "@/lib/prisma";
import { createSession, toProfile, userInclude, verifyPassword } from "@/lib/auth";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const POST = handle(async (request: Request) => {
  const body = await readJson(request);
  const email = str(body.email, 254).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return fail("Email and password are required", 400);

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: userInclude,
  });
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;
  // Same message for "no such user" and "wrong password" so accounts can't be probed.
  if (!user || !valid) return fail("Invalid email or password", 401);
  if (user.status !== "ACTIVE") return fail("This account has been suspended", 403);

  await createSession(user.id);
  return ok(toProfile(user));
});
