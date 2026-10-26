// Categories mega-menu: opens on hover or click, keyboard accessible (Escape
// closes, arrow keys move between top categories), sourced from the catalog.

import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import * as Icons from "lucide-react";
import { useCatalog } from "../../contexts/CatalogContext";
import { cn } from "../ui/utils";

export function MegaMenu({ variant = "primary" }: { variant?: "primary" | "link" }) {
  const { topCategories, childrenOf } = useCatalog();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const activeCat = topCategories.find((c) => c.id === active) ?? topCategories[0];
  const subs = activeCat ? childrenOf(activeCat.id) : [];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); (rootRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus(); }
    if (!open || topCategories.length === 0) return;
    const idx = topCategories.findIndex((c) => c.id === activeCat?.id);
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(topCategories[Math.min(topCategories.length - 1, idx + 1)].id); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive(topCategories[Math.max(0, idx - 1)].id); }
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => { clearTimeout(closeTimer.current); setOpen(true); }}
      onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpen(false), 120); }}
      onKeyDown={onKey}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground hover:text-primary",
        )}
      >
        <LayoutGrid size={16} />
        Categories
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && topCategories.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 grid w-[720px] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-lg border border-border bg-popover shadow-sm duration-150 grid-cols-[240px_1fr]">
            <ul className="max-h-[60vh] overflow-y-auto border-r border-border bg-secondary/50 p-2" role="menu">
              {topCategories.map((c) => {
                const Icon = (c.icon && (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon]) || Icons.BookOpen;
                const isActive = activeCat?.id === c.id;
                return (
                  <li key={c.id}>
                    <Link
                      role="menuitem"
                      to={`/category/${c.slug}`}
                      onMouseEnter={() => setActive(c.id)}
                      onFocus={() => setActive(c.id)}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        isActive ? "bg-card text-primary" : "hover:bg-card",
                      )}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 truncate">{c.name}</span>
                      {childrenOf(c.id).length > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="p-5">
              {activeCat && (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Browse</p>
                  <Link to={`/category/${activeCat.slug}`} onClick={() => setOpen(false)} className="font-display text-xl font-semibold tracking-tight hover:text-primary">
                    {activeCat.name}
                  </Link>
                  <div className="mt-4 grid grid-cols-2 gap-1">
                    {subs.map((sub) => (
                      <Link key={sub.id} to={`/category/${sub.slug}`} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                        {sub.name}
                      </Link>
                    ))}
                    {subs.length === 0 && <p className="col-span-2 px-3 py-2 text-sm text-muted-foreground">No subcategories yet.</p>}
                  </div>
                  <Link to={`/category/${activeCat.slug}`} onClick={() => setOpen(false)} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                    View all {activeCat.name} →
                  </Link>
                </>
              )}
            </div>
          </div>
      )}
    </div>
  );
}
