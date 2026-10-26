// Carousel of curated category cards (each: title, 4 books, See More).

import { useQuery } from "../../../../lib/query";
import { services } from "../../../../services";
import { ErrorState } from "../../common/EmptyState";
import { Section } from "../shared";
import { CarouselArrows } from "../CarouselArrows";
import { useEmblaControls } from "../useEmblaControls";
import { CategoryCollectionCard } from "./CategoryCollectionCard";

const BASIS = "min-w-0 shrink-0 grow-0 basis-[88%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4";

function Header({ arrows }: { arrows?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Browse by shelf</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Category collections</h2>
      </div>
      {arrows}
    </div>
  );
}

export function CategoryCollectionSlider() {
  const q = useQuery(["homeSections", "collections"], () => services.homeSections.collections());
  const { viewportRef, canPrev, canNext, prev, next, onKeyDown } = useEmblaControls();

  if (q.loading) {
    return (
      <Section>
        <Header />
        <div className="flex gap-4 overflow-hidden" aria-busy>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${BASIS.replace("pl-4", "")} h-[380px] animate-pulse rounded-lg bg-muted`} />
          ))}
        </div>
      </Section>
    );
  }
  if (q.error) {
    return (
      <Section>
        <Header />
        <ErrorState compact onRetry={q.refetch} />
      </Section>
    );
  }
  const items = (q.data ?? []).filter((c) => c.books.length > 0);
  if (items.length === 0) return null;

  return (
    <Section>
      <Header arrows={(canPrev || canNext) && <CarouselArrows canPrev={canPrev} canNext={canNext} prev={prev} next={next} label="collections" />} />
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Category collections"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <div className="overflow-hidden" ref={viewportRef}>
          <div className="-ml-4 flex touch-pan-y">
            {items.map((c, i) => (
              <div key={c.section.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`} className={BASIS}>
                <CategoryCollectionCard collection={c} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
