import { Link } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "../ui/utils";

export function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = "View all",
  eyebrow,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  /** Small uppercase label above the title. */
  eyebrow?: string;
  /** Extra right-aligned content (rendered before the View all link). */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
        {href && (
          <Link
            to={href}
            className="group inline-flex items-center gap-1 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {hrefLabel}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
