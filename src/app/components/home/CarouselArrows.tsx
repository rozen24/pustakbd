import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../ui/utils";

export function CarouselArrows({ canPrev, canNext, prev, next, label, className }: {
  canPrev: boolean; canNext: boolean; prev: () => void; next: () => void; label: string; className?: string;
}) {
  const btn = "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
  return (
    <div className={cn("flex gap-1.5", className)}>
      <button type="button" className={btn} onClick={prev} disabled={!canPrev} aria-label={`Previous ${label}`}><ChevronLeft size={16} /></button>
      <button type="button" className={btn} onClick={next} disabled={!canNext} aria-label={`Next ${label}`}><ChevronRight size={16} /></button>
    </div>
  );
}
