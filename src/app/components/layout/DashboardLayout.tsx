"use client";

// Shared dashboard shell: grouped left sidebar on desktop, sheet sidebar on
// mobile, paper ground with white content cards. Account, seller and admin
// sections each pass their own nav items.

import { useState } from "react";
import { NavLink, useNavigate, Link, useLocation } from "@/lib/navigation";
import { LayoutDashboard, LogOut, Menu, Store, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { useAuth } from "../../contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

export interface DashNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  group?: string;
}

function SidebarNav({ title, items, onNavigate }: { title: string; items: DashNavItem[]; onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    onNavigate?.();
    await signOut();
    navigate("/");
  }

  // Role-aware cross-links so users can reach the areas they're entitled to.
  const crossLinks: { to: string; label: string; icon: LucideIcon }[] = [];
  if (user?.role === "seller") crossLinks.push({ to: "/seller", label: "Seller Dashboard", icon: Store });
  if (user?.role === "admin") crossLinks.push({ to: "/admin", label: "Admin Dashboard", icon: ShieldCheck });
  crossLinks.push({ to: "/account", label: "My Account", icon: LayoutDashboard });

  const groups: { name: string; items: DashNavItem[] }[] = [];
  items.forEach((it) => {
    const name = it.group ?? "";
    let g = groups.find((x) => x.name === name);
    if (!g) { g = { name, items: [] }; groups.push(g); }
    g.items.push(it);
  });

  const linkCls = "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <nav aria-label={title} className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.name || "_"}>
          {g.name && <p className="mb-1 px-2.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{g.name}</p>}
          <div className="flex flex-col gap-0.5">
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(linkCls, isActive ? "bg-primary/10 font-medium text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground")
                }
              >
                <it.icon size={16} aria-hidden />
                {it.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-border pt-3">
        <div className="flex flex-col gap-0.5">
          {crossLinks
            .filter((cl) => !items.some((it) => it.to === cl.to))
            .map((cl) => (
              <Link key={cl.to} to={cl.to} onClick={onNavigate} className={cn(linkCls, "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <cl.icon size={16} aria-hidden />
                {cl.label}
              </Link>
            ))}
          <button type="button" onClick={handleSignOut} className={cn(linkCls, "text-left text-destructive hover:bg-destructive/10")}>
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </div>
      </div>

      {user?.role === "customer" && (
        <p className="px-2.5 text-xs text-muted-foreground">
          Want to sell books? This is a customer account. Ask an admin to upgrade it to a seller, or{" "}
          <Link to="/register" className="text-primary underline underline-offset-2">register a seller account</Link>.
        </p>
      )}
    </nav>
  );
}

export function DashboardLayout({ title, items, children }: { title: string; items: DashNavItem[]; children: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = [...items].sort((a, b) => b.to.length - a.to.length).find((it) => (it.end ? location.pathname === it.to : location.pathname.startsWith(it.to)));

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-[1320px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[232px_1fr] lg:gap-8">
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 px-2.5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{user?.name ?? "Boierpata"}</p>
              <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
            </div>
            <SidebarNav title={title} items={items} />
          </aside>

          {/* Mobile: compact bar + sheet sidebar */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 lg:hidden">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
              <p className="truncate font-display text-base font-semibold">{current?.label ?? title}</p>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5" aria-label="Open dashboard menu"><Menu size={15} /> Menu</Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] overflow-y-auto bg-background p-4">
                <SheetHeader className="p-0 pb-4">
                  <SheetTitle className="font-display text-xl">{title}</SheetTitle>
                </SheetHeader>
                <SidebarNav title={title} items={items} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
