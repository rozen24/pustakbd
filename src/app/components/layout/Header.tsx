// Site header: utility bar, sticky main row (wordmark, unified search, account,
// wishlist, cart, theme), primary nav with categories mega menu, and popular
// search chips. Condenses below 768px (the bottom tab bar takes over).

import { Link, NavLink } from "@/lib/navigation";
import { useState } from "react";
import {
  ChevronDown, GitCompare, Heart, LogOut, Menu, Moon, Phone, ShoppingBag, Star, Sun, User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { SearchBar } from "./SearchBar";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { useStore } from "../../contexts/StoreContext";
import { useAuth } from "../../contexts/AuthContext";
import { useCatalog } from "../../contexts/CatalogContext";
import { SITE_NAME } from "../../../lib/constants";
import { ComingSoonBadge } from "../common/EmptyState";
import { usePopularSearches, useStoreSettings } from "../common/useStoreSettings";
import { ACADEMIC_KEYS, ISLAMIC_KEYS, findCategory } from "../common/catalogHelpers";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../ui/utils";

const CONTAINER = "mx-auto w-full max-w-[1320px] px-4 lg:px-6";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("shrink-0 rounded font-display text-2xl font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)} aria-label={`${SITE_NAME} home`}>
      {SITE_NAME}<span className="text-primary">.</span>
    </Link>
  );
}

function UtilityBar() {
  const settings = useStoreSettings();
  const phone = settings.data?.supportPhone;
  const link = "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded";
  return (
    <div className="hidden border-b border-border bg-secondary/60 text-xs text-muted-foreground md:block">
      <div className={cn(CONTAINER, "flex h-8 items-center justify-between gap-4")}>
        <span className="truncate">{settings.data?.announcement ?? "Books delivered across Bangladesh"}</span>
        <nav aria-label="Utility" className="flex items-center gap-4">
          <Link to="/page/customer-care" className={cn(link, "flex items-center gap-1")}>
            <Phone size={12} /> Customer Care{phone ? `: ${phone}` : ""}
          </Link>
          <Link to="/track" className={link}>Track Order</Link>
          <Link to="/page/become-a-seller" className={link}>Become a Seller</Link>
          <Link to="/page/affiliate" className={cn(link, "flex items-center gap-1.5")}>Affiliate <ComingSoonBadge /></Link>
          <Link to="/page/book-donation" className={cn(link, "flex items-center gap-1.5")}>Book Donation <ComingSoonBadge /></Link>
          <Link to="/page/help" className={link}>Help</Link>
        </nav>
      </div>
    </div>
  );
}

function PrimaryNav() {
  const { categories } = useCatalog();
  const academic = findCategory(categories, ACADEMIC_KEYS);
  const islamic = findCategory(categories, ISLAMIC_KEYS);
  const links: { label: string; to: string; end?: boolean }[] = [
    { label: "Books", to: "/books", end: true },
    { label: "Authors", to: "/authors" },
    { label: "Publishers", to: "/publishers" },
    { label: "Offers", to: "/books?minDiscount=1" },
    { label: "Best Sellers", to: "/books?flag=bestseller" },
    { label: "New Releases", to: "/books?flag=new" },
    ...(academic ? [{ label: "Academic", to: `/category/${academic.slug}` }] : []),
    ...(islamic ? [{ label: "Islamic", to: `/category/${islamic.slug}` }] : []),
  ];
  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn("rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", isActive ? "text-primary" : "text-foreground/80 hover:text-foreground");

  return (
    <nav aria-label="Primary" className="flex items-center gap-1">
      <MegaMenu />
      {links.map((l) => (
        <NavLink key={l.label} to={l.to} end={l.end} className={navCls}>{l.label}</NavLink>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          More <ChevronDown size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem asChild><Link to="/books?flag=flash">Flash Sale</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/books?flag=award">Award Winners</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/books?flag=editors">Editor's Choice</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/blog">Blog</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/compare">Compare</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/page/about">About us</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

export function PopularSearchChips({ className }: { className?: string }) {
  const { terms } = usePopularSearches();
  if (terms.length === 0) return null;
  return (
    <div className={cn("[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex items-center gap-2 overflow-x-auto", className)}>
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Popular</span>
      {terms.slice(0, 10).map((t) => (
        <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          {t}
        </Link>
      ))}
    </div>
  );
}

export function Header() {
  const { cartCount, wishlist, compare } = useStore();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = resolvedTheme === "dark";

  return (
    <>
      <UtilityBar />
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className={cn(CONTAINER, "flex h-16 items-center gap-3 md:gap-6")}>
          <button type="button" className="rounded p-1 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <Wordmark />
          <SearchBar className="hidden max-w-2xl flex-1 md:block" />

          <div className="ml-auto flex items-center gap-0.5">
            <span className="mr-2 hidden items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground xl:flex" aria-disabled="true" title="Points & Rewards are coming soon">
              <Star size={13} /> Points & Rewards <ComingSoonBadge />
            </span>
            <IconLink to="/compare" label="Compare" count={compare.length} className="hidden lg:flex"><GitCompare size={20} /></IconLink>
            <IconLink to="/wishlist" label="Wishlist" count={wishlist.length} className="hidden sm:flex"><Heart size={20} /></IconLink>
            <IconLink to="/cart" label="Cart" count={cartCount}><ShoppingBag size={20} /></IconLink>
            <Button variant="ghost" size="icon" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setTheme(dark ? "light" : "dark")}>
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden gap-2 px-2 md:flex" aria-label="Account menu">
                    <User size={20} />
                    <span className="hidden max-w-[110px] truncate text-sm lg:inline">{user.name?.split(" ")[0] ?? "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/account">My Account</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/account/orders">My Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/wishlist">Wishlist</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/account/notifications">Notifications</Link></DropdownMenuItem>
                  {user.role === "seller" && <DropdownMenuItem asChild><Link to="/seller">Seller Dashboard</Link></DropdownMenuItem>}
                  {user.role === "admin" && <DropdownMenuItem asChild><Link to="/admin">Admin Dashboard</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut size={15} className="mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="outline" className="ml-1 hidden md:inline-flex"><Link to="/login">Sign in</Link></Button>
            )}
          </div>
        </div>

        <div className="hidden border-t border-border lg:block">
          <div className={cn(CONTAINER, "flex h-12 items-center")}>
            <PrimaryNav />
          </div>
        </div>

        <div className="border-t border-border px-4 py-2 md:hidden">
          <SearchBar />
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function IconLink({ to, label, count, children, className }: { to: string; label: string; count: number; children: React.ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={cn("relative flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)}
    >
      {children}
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
