import { useQuery } from "../../../lib/query";
import { services } from "../../../services";

/** Store settings (homeSections, popularSearches, support phone…). Cached. */
export function useStoreSettings() {
  return useQuery(["store", "settings"], () => services.store.settings());
}

/** Popular search keywords: admin-set list first, then the server's popular list. */
export function usePopularSearches() {
  const settings = useStoreSettings();
  const fromSettings = settings.data?.popularSearches?.filter(Boolean) ?? [];
  const popular = useQuery(["search", "popular"], () => services.search.popular(), {
    enabled: !settings.loading && fromSettings.length === 0,
  });
  return {
    terms: fromSettings.length ? fromSettings : popular.data ?? [],
    loading: settings.loading || popular.loading,
  };
}
