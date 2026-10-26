// Campaign tabs for Quick Deal. Only live campaigns are passed in; the list
// scrolls horizontally on narrow screens without widening the page.

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { timeLeft } from "../../../../lib/format";
import { QuickDealCarousel } from "./QuickDealCarousel";
import type { DealTab, DealType } from "../../../../types";

export const DEAL_LABEL: Record<DealType, string> = {
  TODAYS_DEAL: "Today's Deal",
  BUY_ONE_GET_ONE: "Buy 1 Get 1",
  FREE_SHIPPING: "Free Shipping",
  BEST_PRICE: "Best Price",
  CLEARANCE_SALE: "Clearance Sale",
};

function Countdown({ endAt }: { endAt: string }) {
  const [t, setT] = useState(() => timeLeft(endAt));
  useEffect(() => {
    const id = window.setInterval(() => setT(timeLeft(endAt)), 1000);
    return () => window.clearInterval(id);
  }, [endAt]);
  if (t.done) return <span className="text-xs text-muted-foreground">Ended</span>;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="text-xs tabular-nums text-muted-foreground" aria-label="Time left">
      Ends in {t.d > 0 && `${t.d}d `}{pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
}

export function QuickDealTabs({ tabs }: { tabs: DealTab[] }) {
  const [active, setActive] = useState(tabs[0].campaign.id);
  const current = tabs.find((t) => t.campaign.id === active) ?? tabs[0];

  return (
    <Tabs value={current.campaign.id} onValueChange={setActive} className="gap-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 md:px-4">
        <div className="-mx-1 min-w-0 max-w-full overflow-x-auto px-1 [scrollbar-width:none]">
          <TabsList className="h-auto w-max gap-1 bg-transparent p-0">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.campaign.id}
                value={t.campaign.id}
                className="h-8 flex-none rounded-full border border-border px-3.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                {t.campaign.name || DEAL_LABEL[t.campaign.type]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {current.campaign.end_at && <Countdown endAt={current.campaign.end_at} />}
      </div>
      {tabs.map((t) => (
        <TabsContent key={t.campaign.id} value={t.campaign.id} className="p-3 animate-in fade-in-0 duration-200 md:p-4">
          {t.campaign.description && <p className="mb-3 text-sm text-muted-foreground">{t.campaign.description}</p>}
          <QuickDealCarousel tab={t} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
