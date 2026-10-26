// Quick Deal section container: fetches live campaigns (one aggregate request)
// and renders the bordered block with header bar, tabs and carousel.

import { useQuery } from "../../../../lib/query";
import { services } from "../../../../services";
import { ErrorState } from "../../common/EmptyState";
import { CONTAINER } from "../shared";
import { QuickDealTabs } from "./QuickDealTabs";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-6 md:py-8" aria-labelledby="quick-deal-heading">
      <div className={CONTAINER}>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="bg-primary px-4 py-2.5 text-primary-foreground">
            <h2 id="quick-deal-heading" className="font-display text-lg font-semibold tracking-tight">Quick Deal ⚡</h2>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function QuickDealSkeleton() {
  return (
    <div aria-busy className="p-3 md:p-4">
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-muted" />)}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={i >= 2 ? (i >= 3 ? "hidden lg:block" : "hidden md:block") : undefined}>
            <div className="aspect-[2/3] animate-pulse rounded-[3px] bg-muted" />
            <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-8 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickDeal() {
  const q = useQuery(["deals", "quick"], () => services.deals.quickDeals(12));

  if (q.loading) return <Shell><QuickDealSkeleton /></Shell>;
  if (q.error) return <Shell><div className="p-4"><ErrorState compact title="Couldn't load deals" onRetry={q.refetch} /></div></Shell>;
  const tabs = (q.data ?? []).filter((t) => t.items.length > 0);
  if (tabs.length === 0) return null;
  return <Shell><QuickDealTabs tabs={tabs} /></Shell>;
}
