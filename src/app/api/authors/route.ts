import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { toAuthor, uniqueSlug } from "@/lib/catalog-admin";
import { prismaRepositories } from "@/services/prisma-repositories";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const GET = handle(async () => ok(await prismaRepositories.catalog.authors()));

export const POST = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const b = await readJson(request);
  const name = str(b.name, 120);
  if (!name) return fail("Please enter the author's name", 400);
  const row = await prisma.author.create({
    data: {
      name,
      slug: await uniqueSlug("author", str(b.slug, 60) || name),
      bio: str(b.bio, 5000) || null,
      photoUrl: str(b.photoUrl, 500) || null,
    },
  });
  return ok(toAuthor(row, 0), { status: 201 });
});
