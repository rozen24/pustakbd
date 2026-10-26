import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth";
import { handle, ok, readJson, str } from "@/lib/api-route";

// Always answers { ok: true } so the form never reveals which emails exist.
// NOTE: no email provider is wired up yet. In development the reset link is
// printed in the server terminal. Before going live, send it by email here.
export const POST = handle(async (request: Request) => {
  const email = str((await readJson(request)).email, 254).toLowerCase();
  if (email) {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });
      await prisma.verificationToken.create({
        data: { identifier: user.email, token: sha256(token), expires: new Date(Date.now() + 3_600_000) },
      });
      if (process.env.NODE_ENV !== "production") {
        console.log(`[password reset] ${user.email}: ${new URL(request.url).origin}/reset-password?token=${token}`);
      }
    }
  }
  return ok({ ok: true });
});
