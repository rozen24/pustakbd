// Shared embla-carousel wiring for homepage carousels: prev/next availability,
// scroll handlers and ArrowLeft/ArrowRight keyboard support on the region.

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function useEmblaControls(options: Parameters<typeof useEmblaCarousel>[0] = {}) {
  const [viewportRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", ...options });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api, sync]);

  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    },
    [prev, next],
  );

  return { viewportRef, api, canPrev, canNext, prev, next, onKeyDown };
}
