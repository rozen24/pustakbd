// Embla carousel of deal cards: 2 / 3 / 5 per view, swipe, arrows, keyboard.

import { useEffect } from "react";
import { CarouselArrows } from "../CarouselArrows";
import { useEmblaControls } from "../useEmblaControls";
import { QuickDealCard } from "./QuickDealCard";
import type { DealTab } from "../../../../types";

export function QuickDealCarousel({ tab }: { tab: DealTab }) {
  const { viewportRef, api, canPrev, canNext, prev, next, onKeyDown } = useEmblaControls();

  // Reset to the first slide when switching tabs.
  useEffect(() => { api?.scrollTo(0, true); }, [api, tab.campaign.id]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${tab.campaign.name} deals`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="overflow-hidden" ref={viewportRef}>
        <div className="-ml-3 flex touch-pan-y md:-ml-4">
          {tab.items.map(({ deal, book }, i) => (
            <div
              key={deal.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${tab.items.length}`}
              className="min-w-0 shrink-0 grow-0 basis-1/2 pl-3 md:basis-1/3 md:pl-4 lg:basis-1/5"
            >
              <QuickDealCard deal={deal} book={book} type={tab.campaign.type} />
            </div>
          ))}
        </div>
      </div>
      {(canPrev || canNext) && (
        <CarouselArrows canPrev={canPrev} canNext={canNext} prev={prev} next={next} label="deals" className="mt-4 justify-end" />
      )}
    </div>
  );
}
