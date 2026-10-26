import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { toPublisher, uniqueSlug } from "@/lib/catalog-admin";
import { prismaRepositories } from "@/services/prisma-repositories";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const GET = handle(async () => ok(await prismaRepositories.catalog.publishers()));

export const POST = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const b = await readJson(request);
  const name = str(b.name, 120);
  if (!name) return fail("Please enter the publisher's name", 400);
  const row = await prisma.publisher.create({
    data: { name, slug: await uniqueSlug("publisher", str(b.slug, 60) || name) },
  });
  return ok(toPublisher(row, 0), { status: 201 });
});
