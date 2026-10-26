// Store settings (shipping fee, free-shipping threshold, delivery estimate),
// with safe fallbacks to the built-in constants when a field is absent or the
// request fails.

import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { DHAKA_SHIPPING, FREE_SHIPPING_THRESHOLD } from "../../../lib/constants";

export function useStoreSettings() {
  const q = useQuery(["store", "settings"], () => services.store.settings());
  const s = q.data ?? {};
  return {
    loading: q.loading,
    shippingFee: typeof s.shippingFee === "number" ? s.shippingFee : DHAKA_SHIPPING,
    freeShippingThreshold: typeof s.freeShippingThreshold === "number" ? s.freeShippingThreshold : FREE_SHIPPING_THRESHOLD,
    deliveryEstimate: s.deliveryEstimate?.trim() || "Delivered in 2–5 working days across Bangladesh",
    raw: s,
  };
}
