import { prisma } from "@/lib/prisma";
import { seedSettings } from "@/services/seed";
import { DHAKA_SHIPPING, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

// Store settings: the StoreSetting row "store" merged over the seed defaults.
async function getStoreSettings(): Promise<Record<string, unknown>> {
  const row = await prisma.storeSetting.findUnique({ where: { key: "store" } });
  const stored =
    row && typeof row.value === "object" && row.value !== null && !Array.isArray(row.value) ? row.value : {};
  return { ...seedSettings, ...stored };
}

// Same fallbacks as the browser's useStoreSettings hook, so the server charges
// exactly what checkout shows.
export async function getShippingRules() {
  const s = await getStoreSettings();
  return {
    shippingFee: typeof s.shippingFee === "number" ? s.shippingFee : DHAKA_SHIPPING,
    freeShippingThreshold:
      typeof s.freeShippingThreshold === "number" ? s.freeShippingThreshold : FREE_SHIPPING_THRESHOLD,
  };
}