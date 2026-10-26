import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { DEAL_TYPES, type DealTypeValue, toDealCampaign, uniqueCampaignSlug } from "@/lib/deals";
import { fail, handle, ok, readJson, str } from "@/lib/api-route";

export const GET = handle(async () => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const rows = await prisma.dealCampaign.findMany({ orderBy: { displayOrder: "asc" } });
  return ok(rows.map(toDealCampaign));
});

export const POST = handle(async (request: Request) => {
  const auth = await requireRole("ADMIN", "EDITOR");
  if (auth.error) return auth.error;
  const b = await readJson(request);

  const name = str(b.name, 120);
  const type = str(b.type, 30).toUpperCase() as DealTypeValue;
  if (!name) return fail("Please enter a campaign name", 400);
  if (!DEAL_TYPES.includes(type)) return fail("Please choose a campaign type", 400);

  const startAt = b.start_at ? new Date(String(b.start_at)) : new Date();
  const endAt = b.end_at ? new Date(String(b.end_at)) : null;
  if (Number.isNaN(startAt.getTime())) return fail("Enter a valid start date", 400);
  if (endAt && (Number.isNaN(endAt.getTime()) || endAt <= startAt)) return fail("The end date must be after the start date", 400);

  const last = await prisma.dealCampaign.aggregate({ _max: { displayOrder: true } });
  const displayOrder = Number.isInteger(b.display_order) ? (b.display_order as number) : (last._max.displayOrder ?? -1) + 1;

  const row = await prisma.dealCampaign.create({
    data: {
      name,
      slug: await uniqueCampaignSlug(str(b.slug, 60) || name),
      type,
      description: str(b.description, 1000) || null,
      banner: str(b.banner, 500) || null,
      startAt,
      endAt,
      active: b.is_active !== false,
      displayOrder,
    },
  });
  return ok(toDealCampaign(row), { status: 201 });
});
