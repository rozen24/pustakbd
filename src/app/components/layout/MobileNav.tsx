// Mobile navigation: the left drawer (links + categories) and the bottom tab
// bar (Home, Categories, Search, Cart, Account) shown below 768px.

import { useState } from "react";
import { Link, NavLink } from "@/lib/navigation";
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useCatalog } from "../../contexts/CatalogContext";
import { useStore } from "../../contexts/StoreContext";
import { useAuth } from "../../contexts/AuthContext";
import { ComingSoonBadge } from "../common/EmptyState";
import { SearchBar } from "./SearchBar";
import { cn } from "../ui/utils";

const PRIMARY = [
  { label: "All Books", to: "/books" },
  { label: "Authors", to: "/authors" },
  { label: "Publishers", to: "/publishers" },
  { label: "Offers", to: "/books?minDiscount=1" },
  { label: "Best Sellers", to: "/books?flag=bestseller" },
  { label: "New Releases", to: "/books?flag=new" },
  { label: "Flash Sale", to: "/books?flag=flash" },
  { label: "Blog", to: "/blog" },
];

const UTILITY = [
  { label: "Track Order", to: "/track" },
  { label: "Customer Care", to: "/page/customer-care" },
  { label: "Become a Seller", to: "/page/become-a-seller" },
  { label: "Help", to: "/page/help" },
];

function CategoryAccordion({ onClose }: { onClose: () => void }) {
  const { topCategories, childrenOf } = useCatalog();
  if (topCategories.length === 0) return <p className="px-3 text-sm text-muted-foreground">No categories yet.</p>;
  return (
    <Accordion type="single" collapsible>
      {topCategories.map((c) => {
        const subs = childrenOf(c.id);
        if (subs.length === 0) {
          return (
            <Link key={c.id} to={`/category/${c.slug}`} onClick={onClose} className="block rounded-md px-3 py-2.5 text-sm hover:bg-muted">{c.name}</Link>
          );
        }
        return (
          <AccordionItem key={c.id} value={c.id} className="border-none">
            <AccordionTrigger className="px-3 py-2.5 text-sm hover:no-underline">{c.name}</AccordionTrigger>
            <AccordionContent className="pb-1">
              <Link to={`/category/${c.slug}`} onClick={onClose} className="block rounded-md px-5 py-2 text-sm font-medium text-primary">All {c.name}</Link>
              {subs.map((sub) => (
                <Link key={sub.id} to={`/category/${sub.slug}`} onClick={onClose} className="block rounded-md px-5 py-2 text-sm text-muted-foreground hover:bg-muted">{sub.name}</Link>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-80 overflow-y-auto bg-background p-4">
        <SheetHeader className="p-0">
          <SheetTitle className="font-display text-xl font-semibold">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav className="mt-4 flex flex-col">
          {PRIMARY.map((l) => (
            <Link key={l.to} to={l.to} onClick={onClose} className="rounded-md px-3 py-2.5 text-sm hover:bg-muted">{l.label}</Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Categories</p>
          <CategoryAccordion onClose={onClose} />
        </div>
        <div className="mt-4 border-t border-border pt-4">
          {UTILITY.map((l) => (
            <Link key={l.to} to={l.to} onClick={onClose} className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{l.label}</Link>
          ))}
          <span className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground" aria-disabled="true">Points & Rewards <ComingSoonBadge /></span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Fixed bottom tab bar for small screens. */
export function BottomTabBar() {
  const { cartCount } = useStore();
  const { user } = useAuth();
  const [sheet, setSheet] = useState<null | "categories" | "search">(null);
  const close = () => setSheet(null);
  const tab = "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
  const navCls = ({ isActive }: { isActive: boolean }) => cn(tab, isActive ? "text-primary" : "text-muted-foreground");

  return (
    <>
      <nav aria-label="Mobile tabs" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <NavLink to="/" end className={navCls}><Home size={20} />Home</NavLink>
        <button type="button" onClick={() => setSheet("categories")} className={cn(tab, sheet === "categories" ? "text-primary" : "text-muted-foreground")}>
          <LayoutGrid size={20} />Categories
        </button>
        <button type="button" onClick={() => setSheet("search")} className={cn(tab, sheet === "search" ? "text-primary" : "text-muted-foreground")}>
          <Search size={20} />Search
        </button>
        <NavLink to="/cart" className={navCls} aria-label={`Cart (${cartCount})`}>
          <span className="relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">{cartCount}</span>
            )}
          </span>
          Cart
        </NavLink>
        <NavLink to={user ? "/account" : "/login"} className={navCls}><User size={20} />{user ? "Account" : "Sign in"}</NavLink>
      </nav>

      <Sheet open={sheet === "categories"} onOpenChange={(o) => !o && close()}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-lg bg-background p-4">
          <SheetHeader className="p-0">
            <SheetTitle className="font-display text-xl font-semibold">Categories</SheetTitle>
            <SheetDescription className="sr-only">Browse categories</SheetDescription>
          </SheetHeader>
          <div className="mt-3"><CategoryAccordion onClose={close} /></div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "search"} onOpenChange={(o) => !o && close()}>
        <SheetContent side="top" className="bg-background p-4">
          <SheetHeader className="p-0">
            <SheetTitle className="font-display text-xl font-semibold">Search</SheetTitle>
            <SheetDescription className="sr-only">Search books, authors and publishers</SheetDescription>
          </SheetHeader>
          <SearchBar className="mt-3" autoFocus onNavigate={close} />
        </SheetContent>
      </Sheet>
    </>
  );
}
