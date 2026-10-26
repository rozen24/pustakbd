import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = "empty",
  onRetry,
  compact = false,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** "error" renders a destructive-tinted icon and an optional retry button. */
  variant?: "empty" | "error";
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const isError = variant === "error";
  const ShownIcon = isError && Icon === Inbox ? AlertTriangle : Icon;
  return (
    <div
      role={isError ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center",
        compact ? "px-4 py-8" : "px-4 py-16",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
          isError ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
        )}
      >
        <ShownIcon size={22} />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {(action || onRetry) && (
        <div className="mt-5 flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" className="gap-2" onClick={onRetry}>
              <RotateCw size={14} /> Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

/** Error state with retry, for failed async views. */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  compact,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}) {
  return <EmptyState variant="error" title={title} description={description} onRetry={onRetry} compact={compact} className={className} />;
}

/** Honesty badge for features without a backend. */
export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span className={cn("rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground", className)}>
      Coming soon
    </span>
  );
}
