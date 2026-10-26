import { prisma } from "@/lib/prisma";
import { seedSettings } from "@/services/seed";
import { handle, ok } from "@/lib/api-route";

// Settings live in the StoreSetting key/value table under the key "store".
// Anything not stored yet falls back to the defaults in services/seed.
export const GET = handle(async () => {
  const row = await prisma.storeSetting.findUnique({ where: { key: "store" } });
  const stored =
    row && typeof row.value === "object" && row.value !== null && !Array.isArray(row.value) ? row.value : {};
  return ok({ ...seedSettings, ...stored });
});
