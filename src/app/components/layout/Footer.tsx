import { Link } from "@/lib/navigation";
import { Facebook, Instagram, Mail, Phone, Smartphone, Youtube } from "lucide-react";
import { SITE_NAME, SITE_TAGLINE } from "../../../lib/constants";
import { useCatalog } from "../../contexts/CatalogContext";
import { ComingSoonBadge } from "../common/EmptyState";
import { useStoreSettings } from "../common/useStoreSettings";
import { Wordmark } from "./Header";

type Col = { title: string; links: { label: string; to: string }[] };

const page = (label: string, slug: string) => ({ label, to: `/page/${slug}` });

const STATIC_COLUMNS: Col[] = [
  { title: "About", links: [page("About us", "about"), { label: "Blog", to: "/blog" }, page("Careers", "careers"), page("Contact", "contact")] },
  { title: "Customer Service", links: [page("Help centre", "help"), { label: "Track order", to: "/track" }, page("Shipping & delivery", "shipping-returns"), page("Returns & refunds", "returns"), page("Payment methods", "payment")] },
  { title: "Shop", links: [{ label: "All books", to: "/books" }, { label: "Best sellers", to: "/books?flag=bestseller" }, { label: "New releases", to: "/books?flag=new" }, { label: "Offers", to: "/books?minDiscount=1" }, { label: "Authors", to: "/authors" }, { label: "Publishers", to: "/publishers" }] },
  { title: "Sell", links: [page("Become a seller", "become-a-seller"), { label: "Seller dashboard", to: "/seller" }, page("Seller policy", "seller-policy")] },
  { title: "Corporate", links: [page("Corporate orders", "corporate"), page("Affiliate", "affiliate"), page("Book donation", "book-donation")] },
  { title: "Policies", links: [page("Privacy policy", "privacy"), page("Terms of use", "terms"), page("Refund policy", "refund-policy"), page("Cookie policy", "cookies")] },
];

export function Footer() {
  const { topCategories } = useCatalog();
  const settings = useStoreSettings().data;
  const catCol: Col = { title: "Categories", links: topCategories.slice(0, 7).map((c) => ({ label: c.name, to: `/category/${c.slug}` })) };
  const columns = [...STATIC_COLUMNS.slice(0, 3), ...(catCol.links.length ? [catCol] : []), ...STATIC_COLUMNS.slice(3)];

  return (
    <footer className="mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 lg:grid-cols-[1.3fr_3fr] lg:px-6">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{SITE_TAGLINE}. Discover and celebrate books of every kind, delivered nationwide.</p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            {settings?.supportPhone && <li className="flex items-center gap-2"><Phone size={14} /> {settings.supportPhone}</li>}
            {settings?.supportEmail && <li className="flex items-center gap-2"><Mail size={14} /> {settings.supportEmail}</li>}
          </ul>
          <div className="mt-5 flex gap-2">
            {[{ Icon: Facebook, label: "Facebook", href: "https://facebook.com" }, { Icon: Instagram, label: "Instagram", href: "https://instagram.com" }, { Icon: Youtube, label: "YouTube", href: "https://youtube.com" }].map(({ Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                <Icon size={16} />
              </a>
            ))}
          </div>
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Get the app <ComingSoonBadge /></p>
            <div className="flex gap-2" aria-disabled="true">
              {["Google Play", "App Store"].map((s) => (
                <span key={s} className="flex cursor-not-allowed items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground opacity-70">
                  <Smartphone size={14} /> {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-7">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border py-5">
        <p className="mx-auto max-w-[1320px] px-4 text-center text-xs text-muted-foreground lg:px-6">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Prices in Bangladeshi Taka (৳).
        </p>
      </div>
    </footer>
  );
}
