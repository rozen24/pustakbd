import { prisma } from "@/lib/prisma";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public newsletter sign-up (footer form). Signing up twice is not an error.
export const POST = handle(async (request: Request) => {
  const email = str((await readJson(request)).email, 254).toLowerCase();
  if (!EMAIL.test(email)) return fail("Please enter a valid email address", 400);
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return ok({ ok: true, already: true });
  await prisma.newsletterSubscriber.create({ data: { email } });
  return ok({ ok: true, already: false }, { status: 201 });
});
