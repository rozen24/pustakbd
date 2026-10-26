// Shared page-level primitives for storefront pages: page header, error state
// with retry, and the "Coming soon" honesty badge.

import { Link } from "@/lib/navigation";
import { AlertTriangle, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export const CONTAINER = "mx-auto w-full max-w-[1320px] px-4 lg:px-6";

export function ErrorState({
  title = "Something went wrong",
  error,
  onRetry,
  className,
}: {
  title?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/30 bg-card px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle size={22} />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {error?.message ? `We couldn't load this: ${error.message}` : "Please check your connection and try again."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5 gap-2" onClick={onRetry}>
          <RotateCw size={14} /> Try again
        </Button>
      )}
    </div>
  );
}

export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground", className)}>
      Coming soon
    </span>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground", className)}>{children}</p>;
}

export interface Crumb { label: string; to?: string }

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1 text-xs text-muted-foreground", className)}>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="opacity-60" />}
          {c.to ? <Link to={c.to} className="hover:text-foreground">{c.label}</Link> : <span className="line-clamp-1 text-foreground">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 border-b border-border pb-6", className)}>
      {crumbs && <Breadcrumbs items={crumbs} className="mb-4" />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          {description && <div className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</div>}
        </div>
        {actions}
      </div>
    </header>
  );
}

export function PanelSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
