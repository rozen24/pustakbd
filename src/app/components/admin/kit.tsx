// Shared dashboard primitives (seller + admin): page headers, panels, KPI
// tiles, dense hairline tables, skeleton / error states, confirm dialogs,
// status pills and the image-upload helper.

import { useState } from "react";
import { AlertTriangle, RotateCw, Trash2, type LucideIcon } from "lucide-react";
import { api } from "../../../services/api/client";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";

export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export const chartAxis = { tick: { fontSize: 11, fill: "var(--muted-foreground)" }, stroke: "var(--border)", tickLine: false, axisLine: false } as const;
export const chartTooltip = {
  contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--foreground)" },
  cursor: { fill: "var(--muted)", opacity: 0.5 },
} as const;

// Upload an image via the existing product-image endpoint; returns a public URL.
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or smaller");
  const fd = new FormData();
  fd.append("file", file);
  const { url } = await api.upload<{ url: string }>("/uploads/product-image", fd);
  return url;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          {title && <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] uppercase tracking-[0.14em]">{label}</span>
        <Icon size={16} aria-hidden />
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <div key={i} className="h-[92px] animate-pulse rounded-lg bg-muted" />)}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card" aria-busy>
      <div className="h-9 border-b border-border bg-muted/60" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0">
          <div className="h-8 w-6 animate-pulse rounded-[3px] bg-muted" />
          <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function BlockSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-64 animate-pulse rounded-lg bg-muted", className)} />;
}

export function ErrorState({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12 text-center">
      <AlertTriangle size={22} className="text-destructive" aria-hidden />
      <p className="mt-3 font-display text-lg font-semibold">Couldn't load this view</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error?.message ?? "Something went wrong."}</p>
      <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onRetry}><RotateCw size={14} /> Retry</Button>
    </div>
  );
}

// Dense hairline table wrapper.
export function DataTable({ head, children, minWidth = 640 }: { head: React.ReactNode[]; children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <tr>{head.map((h, i) => <th key={i} className={cn("px-3 py-2 font-medium", i === head.length - 1 && "text-right")}>{h}</th>)}</tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0 [&>tr:hover]:bg-muted/30 [&_td]:px-3 [&_td]:py-2.5">
          {children}
        </tbody>
      </table>
    </div>
  );
}

const PILL: Record<string, string> = {
  positive: "bg-accent/10 text-accent",
  negative: "bg-destructive/10 text-destructive",
  primary: "bg-primary/10 text-primary",
  neutral: "bg-secondary text-muted-foreground",
};
export function Pill({ tone = "neutral", children }: { tone?: keyof typeof PILL; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize", PILL[tone])}>{children}</span>;
}

export function orderTone(status: string): keyof typeof PILL {
  if (status === "delivered") return "positive";
  if (status === "cancelled") return "negative";
  if (status === "pending") return "neutral";
  return "primary";
}

export function ComingSoon() {
  return <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Coming soon</span>;
}

// Delete button guarded by an AlertDialog.
export function ConfirmDelete({ label = "Delete", title, description, onConfirm, iconOnly }: { label?: string; title: string; description?: string; onConfirm: () => Promise<void> | void; iconOnly?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={`${label}: ${title}`}><Trash2 size={14} /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive"><Trash2 size={14} /> {label}</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? "This cannot be undone."}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async (e) => {
              e.preventDefault();
              setBusy(true);
              try { await onConfirm(); setOpen(false); } finally { setBusy(false); }
            }}
          >
            {busy ? "Working…" : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Group orders into a continuous daily series for the last `days` days.
export function dailySeries(orders: { createdAt: string; total: number }[], days = 14) {
  const map = new Map<string, { revenue: number; orders: number }>();
  orders.forEach((o) => {
    const k = o.createdAt.slice(0, 10);
    const prev = map.get(k) ?? { revenue: 0, orders: 0 };
    map.set(k, { revenue: prev.revenue + o.total, orders: prev.orders + 1 });
  });
  const out: { date: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const k = d.toISOString().slice(0, 10);
    out.push({ date: k, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), ...(map.get(k) ?? { revenue: 0, orders: 0 }) });
  }
  return out;
}
