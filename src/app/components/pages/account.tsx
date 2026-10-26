// Customer account sub-pages, rendered inside AccountLayout's <Outlet />.

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { ArrowRight, Bell, CheckCheck, Gift, Heart, MapPin, Package, Plus, Star, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { useAuth } from "../../contexts/AuthContext";
import { useStore } from "../../contexts/StoreContext";
import { BookCover } from "../common/BookCover";
import { EmptyState } from "../common/EmptyState";
import { RatingStars } from "../common/RatingStars";
import { ComingSoonBadge, ErrorState, Eyebrow, PanelSkeleton } from "../catalog/states";
import { OrderTimeline, OrderSummaryCard, StatusBadge } from "./orders-public";
import { formatTk, formatDate } from "../../../lib/format";
import { DISTRICTS } from "../../../lib/constants";
import type { Address, Order, OrderStatus } from "../../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { cn } from "../ui/utils";

function SectionHead({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <Eyebrow className="mb-1">{eyebrow}</Eyebrow>}
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function AccountDashboard() {
  const { user } = useAuth();
  const orders = useQuery(["orders", "mine"], () => services.orders.listForUser());
  const notifs = useQuery(["notifications"], () => services.notifications.forUser());
  const { wishlist } = useStore();
  const unread = notifs.data?.filter((n) => !n.read).length ?? 0;
  const active = orders.data?.filter((o) => !["delivered", "cancelled"].includes(o.status)).length ?? 0;

  const stats = [
    { label: "Orders", value: orders.loading ? "…" : String(orders.data?.length ?? 0), hint: active ? `${active} in progress` : "All up to date", icon: Package, to: "/account/orders" },
    { label: "Wishlist", value: String(wishlist.length), hint: "Saved books", icon: Heart, to: "/account/wishlist" },
    { label: "Notifications", value: notifs.loading ? "…" : String(unread), hint: "Unread", icon: Bell, to: "/account/notifications" },
    { label: "Addresses", value: String(user?.addresses?.length ?? 0), hint: "Saved", icon: MapPin, to: "/account/addresses" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border bg-card p-6">
        <Eyebrow>My account</Eyebrow>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Hello, {user?.name?.split(" ")[0] || "reader"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}{user?.createdAt ? ` · Member since ${formatDate(user.createdAt)}` : ""}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon size={16} className="text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.hint}</p>
          </Link>
        ))}
      </div>
      <div>
        <SectionHead eyebrow="Latest" title="Recent orders" action={<Link to="/account/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight size={14} /></Link>} />
        <OrdersList orders={orders.data} loading={orders.loading} error={orders.error} onRetry={orders.refetch} compact />
      </div>
    </div>
  );
}

function OrdersList({ orders, loading, error, onRetry, compact }: { orders?: Order[]; loading?: boolean; error?: Error | null; onRetry?: () => void; compact?: boolean }) {
  if (loading) return <PanelSkeleton rows={compact ? 2 : 4} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} title="Couldn't load your orders" />;
  if (!orders || orders.length === 0) {
    return <EmptyState icon={Package} title="No orders yet" description="When you place an order it'll show up here." action={<Button asChild><Link to="/books">Start shopping</Link></Button>} />;
  }
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const shown = compact ? sorted.slice(0, 3) : sorted;
  return (
    <ul className="space-y-3">
      {shown.map((o) => (
        <li key={o.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium tabular-nums">{o.id}</p>
              <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={o.status} />
              <span className="font-semibold tabular-nums">{formatTk(o.total)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {o.items.slice(0, 5).map((it) => (
              <div key={it.bookId} className="h-14 w-10 overflow-hidden rounded-[3px] shadow-sm" title={it.title}><BookCover title={it.title} coverUrl={it.coverUrl} /></div>
            ))}
            {o.items.length > 5 && <span className="text-xs text-muted-foreground">+{o.items.length - 5}</span>}
            <div className="ml-auto flex gap-2">
              <Button asChild variant="ghost" size="sm"><Link to={`/track/${o.id}`}>Track</Link></Button>
              <Dialog>
                <DialogTrigger asChild><Button variant="outline" size="sm">Details</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                  <DialogHeader><DialogTitle className="font-display">Order {o.id}</DialogTitle></DialogHeader>
                  <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                    <div><Eyebrow className="mb-3">Status</Eyebrow><OrderTimeline order={o} /></div>
                    <OrderSummaryCard order={o} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

const ORDER_FILTERS: { id: "all" | "active" | OrderStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function AccountOrders() {
  const orders = useQuery(["orders", "mine"], () => services.orders.listForUser());
  const [filter, setFilter] = useState<(typeof ORDER_FILTERS)[number]["id"]>("all");
  const list = orders.data?.filter((o) =>
    filter === "all" ? true : filter === "active" ? !["delivered", "cancelled"].includes(o.status) : o.status === filter);
  return (
    <div>
      <SectionHead eyebrow="History" title="My orders" />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter orders">
        {ORDER_FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn("rounded-full border px-3 py-1 text-xs transition-colors", filter === f.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/40")}>{f.label}</button>
        ))}
      </div>
      <OrdersList orders={list} loading={orders.loading} error={orders.error} onRetry={orders.refetch} />
    </div>
  );
}

export function AccountReviews() {
  const reviews = useQuery(["reviews", "mine"], () => services.reviews.forUser());
  return (
    <div>
      <SectionHead eyebrow="Your voice" title="My reviews" />
      {reviews.loading ? <PanelSkeleton rows={3} /> : reviews.error ? (
        <ErrorState error={reviews.error} onRetry={reviews.refetch} title="Couldn't load your reviews" />
      ) : !reviews.data || reviews.data.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews you write will appear here." action={<Button asChild variant="outline"><Link to="/books">Find a book to review</Link></Button>} />
      ) : (
        <ul className="space-y-3">
          {reviews.data.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <RatingStars value={r.rating} />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(r.createdAt)}</span>
                  <span className={cn("rounded-full px-2 py-0.5 font-medium", r.approved ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground")}>{r.approved ? "Published" : "Pending approval"}</span>
                </div>
              </div>
              {r.title && <p className="mt-3 font-display font-semibold">{r.title}</p>}
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AccountNotifications() {
  const notifs = useQuery(["notifications"], () => services.notifications.forUser());
  const [busy, setBusy] = useState(false);
  const markRead = async (id: string) => {
    try { await services.notifications.markRead(id); notifs.refetch(); } catch (e) { console.error(e); toast.error("Couldn't mark as read"); }
  };
  const unread = notifs.data?.filter((n) => !n.read) ?? [];
  const markAll = async () => {
    setBusy(true);
    try { await Promise.all(unread.map((n) => services.notifications.markRead(n.id))); notifs.refetch(); }
    catch (e) { console.error(e); toast.error("Couldn't mark all as read"); }
    finally { setBusy(false); }
  };
  const sorted = [...(notifs.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <SectionHead
        eyebrow={unread.length ? `${unread.length} unread` : "Inbox"}
        title="Notifications"
        action={unread.length > 0 ? <Button variant="outline" size="sm" className="gap-2" disabled={busy} onClick={markAll}><CheckCheck size={14} /> Mark all read</Button> : undefined}
      />
      {notifs.loading ? <PanelSkeleton rows={4} /> : notifs.error ? (
        <ErrorState error={notifs.error} onRetry={notifs.refetch} title="Couldn't load notifications" />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Order updates will show up here." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {sorted.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => !n.read && markRead(n.id)}
                className={cn("flex w-full gap-4 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40", n.read ? "hover:bg-secondary/50" : "bg-primary/[0.04] hover:bg-primary/[0.07]")}
                aria-label={n.read ? n.title : `${n.title} (unread, click to mark read)`}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AccountAddresses() {
  const { user, saveAddress } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "Home", fullName: "", phone: "", district: "Dhaka", area: "", street: "" });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr: Address = { id: `addr_${Date.now()}`, isDefault: (user?.addresses?.length ?? 0) === 0, ...form };
    setSaving(true);
    try { await saveAddress(addr); toast.success("Address saved"); setOpen(false); setForm({ label: "Home", fullName: "", phone: "", district: "Dhaka", area: "", street: "" }); }
    catch (err) { toast.error((err as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <SectionHead
        eyebrow="Delivery"
        title="Addresses"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus size={15} /> Add address</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">New address</DialogTitle></DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label htmlFor="ad-label">Label</Label><Input id="ad-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label htmlFor="ad-name">Full name</Label><Input id="ad-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                  <div className="space-y-1.5"><Label htmlFor="ad-phone">Phone</Label><Input id="ad-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
                  <div className="space-y-1.5"><Label htmlFor="ad-district">District</Label>
                    <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                      <SelectTrigger id="ad-district"><SelectValue /></SelectTrigger>
                      <SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="ad-area">Area</Label><Input id="ad-area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label htmlFor="ad-street">Street</Label><Input id="ad-street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required /></div>
                <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving…" : "Save address"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {!user?.addresses || user.addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" description="Add a delivery address for faster checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {user.addresses.map((a) => (
            <div key={a.id} className={cn("rounded-lg border bg-card p-5", a.isDefault ? "border-primary/40" : "border-border")}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display font-semibold"><MapPin size={15} className="text-muted-foreground" /> {a.label}</span>
                {a.isDefault && <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">Default</span>}
              </div>
              <p className="mt-3 text-sm">{a.fullName} · {a.phone}</p>
              <p className="text-sm text-muted-foreground">{a.street}, {a.area}, {a.district}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await updateProfile(form); toast.success("Profile updated"); } catch (err) { toast.error((err as Error).message); } finally { setSaving(false); }
  };

  return (
    <div>
      <SectionHead eyebrow="Settings" title="Profile" />
      <form onSubmit={save} className="max-w-xl rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary font-display text-xl font-semibold">{(user?.name || "?").charAt(0).toUpperCase()}</span>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs capitalize text-muted-foreground">{user?.role} account</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="pf-name">Name</Label><Input id="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="pf-email">Email</Label><Input id="pf-email" value={user?.email ?? ""} disabled /><p className="text-xs text-muted-foreground">Email can't be changed here.</p></div>
          <div className="space-y-1.5"><Label htmlFor="pf-phone">Phone</Label><Input id="pf-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <Button type="submit" className="mt-6" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </form>
    </div>
  );
}

export function AccountWallet() {
  const { user } = useAuth();
  return (
    <div>
      <SectionHead eyebrow="Rewards" title="Wallet & rewards" action={<ComingSoonBadge />} />
      <div className="mb-5 rounded-lg border border-dashed border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
        Wallet top-ups, payouts and points redemption aren't available yet. Balances below are shown for reference only.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6 opacity-80">
          <div className="flex items-center justify-between"><Wallet size={20} className="text-muted-foreground" /><ComingSoonBadge /></div>
          <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{formatTk(user?.walletBalance ?? 0)}</p>
          <p className="text-sm text-muted-foreground">Wallet balance</p>
          <Button className="mt-4" variant="outline" size="sm" disabled aria-disabled>Add money</Button>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 opacity-80">
          <div className="flex items-center justify-between"><Gift size={20} className="text-muted-foreground" /><ComingSoonBadge /></div>
          <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{user?.rewardPoints ?? 0}</p>
          <p className="text-sm text-muted-foreground">Reward points</p>
          <Button className="mt-4" variant="outline" size="sm" disabled aria-disabled>Redeem points</Button>
        </div>
      </div>
    </div>
  );
}
