// Public order pages: confirmation (after checkout) and order tracking.

import { useState } from "react";
import { Link, useNavigate, useParams } from "@/lib/navigation";
import { CheckCircle2, Circle, Package, Search, Truck, XCircle } from "lucide-react";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { BookCover } from "../common/BookCover";
import { EmptyState } from "../common/EmptyState";
import { CONTAINER, ErrorState, Eyebrow, PanelSkeleton } from "../catalog/states";
import { formatTk, formatDate, formatDateTime } from "../../../lib/format";
import { PAYMENT_METHODS } from "../../../lib/constants";
import type { Order, OrderStatus } from "../../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order placed", confirmed: "Confirmed", processing: "Processing",
  shipped: "Shipped", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "delivered" ? "bg-accent/10 text-accent" : status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground";
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>{STATUS_LABEL[status] ?? status}</span>;
}

/** Vertical timeline: the canonical status flow, annotated with the real
 *  timestamps/notes from order.timeline; extra entries are listed as history. */
export function OrderTimeline({ order }: { order: Order }) {
  const timeline = order.timeline ?? [];
  const cancelled = order.status === "cancelled";
  const reachedIdx = Math.max(STATUS_FLOW.indexOf(order.status), ...timeline.map((t) => STATUS_FLOW.indexOf(t.status)));
  const steps: OrderStatus[] = cancelled ? [...STATUS_FLOW.slice(0, Math.max(1, reachedIdx + 1)), "cancelled"] : STATUS_FLOW;
  const currentStatus = order.status;

  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const entry = [...timeline].reverse().find((t) => t.status === s);
        const flowIdx = STATUS_FLOW.indexOf(s);
        const done = s === "cancelled" ? true : flowIdx <= reachedIdx;
        const current = s === currentStatus;
        const last = i === steps.length - 1;
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && <span className={cn("absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px", done && !cancelled ? "bg-accent" : "bg-border")} aria-hidden />}
            <span className={cn(
              "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              s === "cancelled" ? "bg-destructive text-destructive-foreground" : done ? "bg-accent text-accent-foreground" : "border border-border bg-card text-muted-foreground",
              current && s !== "cancelled" && "ring-4 ring-accent/15",
            )}>
              {s === "cancelled" ? <XCircle size={14} /> : done ? <CheckCircle2 size={14} /> : <Circle size={10} />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-sm", done ? "font-medium" : "text-muted-foreground", current && "font-semibold")}>{STATUS_LABEL[s]}</p>
              {entry ? (
                <p className="text-xs text-muted-foreground">{formatDateTime(entry.at)}{entry.note ? ` · ${entry.note}` : ""}</p>
              ) : !done ? <p className="text-xs text-muted-foreground/70">Pending</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderSummaryCard({ order }: { order: Order }) {
  const pay = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ?? order.paymentMethod;
  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Eyebrow>Order</Eyebrow>
          <p className="mt-1 font-display text-lg font-semibold tabular-nums">{order.id}</p>
          <p className="text-xs text-muted-foreground">Placed {formatDate(order.createdAt)} · {pay}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <ul className="divide-y divide-border">
        {order.items.map((it) => (
          <li key={it.bookId} className="flex items-center gap-3 py-3">
            <div className="h-14 w-10 shrink-0 overflow-hidden rounded-[3px] shadow-sm"><BookCover title={it.title} coverUrl={it.coverUrl} /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{it.title}</p><p className="text-xs tabular-nums text-muted-foreground">{it.quantity} × {formatTk(it.price)}</p></div>
            <span className="text-sm tabular-nums">{formatTk(it.price * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatTk(order.subtotal)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd className="tabular-nums text-primary">- {formatTk(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatTk(order.shipping)}</dd></div>
        <div className="flex justify-between border-t border-border pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-lg font-semibold tabular-nums">{formatTk(order.total)}</dd></div>
      </dl>
      <div className="mt-4 border-t border-border pt-4 text-sm">
        <p className="mb-1 font-medium">Delivery to</p>
        <p className="text-muted-foreground">{order.address.fullName}, {order.address.phone}</p>
        <p className="text-muted-foreground">{order.address.street}, {order.address.area}, {order.address.district}</p>
      </div>
    </div>
  );
}

export function OrderConfirmationPage() {
  const { id } = useParams();
  const orderQ = useQuery(["order", id], () => services.orders.getById(id!), { enabled: !!id });

  if (orderQ.loading) return <div className={cn(CONTAINER, "max-w-3xl py-16")}><PanelSkeleton rows={3} /></div>;
  if (orderQ.error) return <div className={cn(CONTAINER, "max-w-3xl py-16")}><ErrorState error={orderQ.error} onRetry={orderQ.refetch} title="Couldn't load your order" /></div>;
  if (!orderQ.data) {
    return <div className={cn(CONTAINER, "max-w-3xl py-16")}><EmptyState icon={Package} title="Order not found" action={<Button asChild><Link to="/">Go home</Link></Button>} /></div>;
  }
  const order = orderQ.data;

  return (
    <div className={cn(CONTAINER, "max-w-4xl py-10")}>
      <div className="mb-8 rounded-lg bg-accent p-8 text-center text-accent-foreground">
        <CheckCircle2 size={36} className="mx-auto" />
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Thank you for your order!</h1>
        <p className="mt-2 text-sm opacity-80">Order <span className="font-semibold tabular-nums">{order.id}</span> has been received. Keep this ID to track your delivery.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <OrderSummaryCard order={order} />
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">Order status</h2>
            <OrderTimeline order={order} />
          </div>
          <Button asChild className="w-full gap-2"><Link to={`/track/${order.id}`}><Truck size={16} /> Track order</Link></Button>
          <Button asChild variant="outline" className="w-full"><Link to="/books">Continue shopping</Link></Button>
        </div>
      </div>
    </div>
  );
}

export function TrackOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(orderId ?? "");
  const activeId = orderId ?? "";
  const orderQ = useQuery(["order", "track", activeId], () => services.orders.getById(activeId), { enabled: !!activeId });

  return (
    <div className={cn(CONTAINER, "max-w-4xl py-10")}>
      <div className="mb-8 border-b border-border pb-8">
        <Eyebrow>Where's my order?</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Track your order</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the order ID from your confirmation to see its current status.</p>
        <form className="mt-5 flex max-w-lg gap-2" role="search" onSubmit={(e) => { e.preventDefault(); const v = input.trim(); if (v) navigate(`/track/${encodeURIComponent(v)}`); }}>
          <Input placeholder="e.g. ord_abc123" value={input} onChange={(e) => setInput(e.target.value)} aria-label="Order ID" />
          <Button type="submit" className="gap-2"><Search size={16} /> Track</Button>
        </form>
      </div>

      {!activeId ? (
        <EmptyState icon={Truck} title="Enter an order ID" description="You'll find it in your confirmation or under My Orders." />
      ) : orderQ.loading ? (
        <PanelSkeleton rows={3} />
      ) : orderQ.error ? (
        <ErrorState error={orderQ.error} onRetry={orderQ.refetch} title="Couldn't look up this order" />
      ) : !orderQ.data ? (
        <EmptyState icon={Package} title="Order not found" description="Double-check the order ID and try again." />
      ) : (
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="rounded-lg border border-border bg-card p-5 md:sticky md:top-28 md:self-start">
            <h2 className="mb-4 font-display text-lg font-semibold">Status</h2>
            <OrderTimeline order={orderQ.data} />
          </div>
          <OrderSummaryCard order={orderQ.data} />
        </div>
      )}
    </div>
  );
}
