// Defers rendering (and thus data fetching) of below-the-fold content until it
// approaches the viewport.

import { useEffect, useRef, useState } from "react";
import { SectionSkeleton } from "./Skeletons";

export function useInView<T extends Element>(rootMargin = "300px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setInView(true); io.disconnect(); }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);
  return [ref, inView] as const;
}

export function LazySection({
  children,
  placeholder,
  minHeight = 320,
  className,
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  minHeight?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={inView ? undefined : { minHeight }}>
      {inView ? children : placeholder ?? <SectionSkeleton />}
    </div>
  );
}
