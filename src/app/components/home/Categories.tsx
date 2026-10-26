// Shop-by-category tiles and the settings-driven category sections.

import { Link } from "@/lib/navigation";
import * as Icons from "lucide-react";
import { useCatalog } from "../../contexts/CatalogContext";
import { useStoreSettings } from "../common/useStoreSettings";
import { SectionHeader } from "../common/SectionHeader";
import { TileGridSkeleton } from "../common/Skeletons";
import { LazySection } from "../common/LazySection";
import { BookCard } from "../common/BookCard";
import { ACADEMIC_KEYS, ISLAMIC_KEYS } from "../common/catalogHelpers";
import { QueryRailSection, Section, useBooks } from "./shared";
import type { Category, HomeSection } from "../../../types";
import { cn } from "../ui/utils";

function iconFor(c: Category) {
  return (c.icon && (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon]) || Icons.BookOpen;
}

export function CategoryTiles() {
  const { topCategories, childrenOf, loading } = useCatalog();
  if (loading && topCategories.length === 0) {
    return <Section><SectionHeader eyebrow="Browse" title="Shop by category" /><TileGridSkeleton /></Section>;
  }
  if (topCategories.length === 0) return null;
  return (
    <Section>
      <SectionHeader eyebrow="Browse" title="Shop by category" href="/books" hrefLabel="All books" />
      <div className="grid auto-rows-[minmax(96px,auto)] grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {topCategories.map((c, idx) => {
          const Icon = iconFor(c);
          const feature = idx === 0 && topCategories.length >= 5;
          const subs = childrenOf(c.id);
          return (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className={cn(
                "group flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                feature && "col-span-2 row-span-2 bg-accent text-accent-foreground",
              )}
            >
              <Icon size={feature ? 28 : 20} className={feature ? "" : "text-primary"} />
              <div className="mt-3">
                <span className={cn("block font-medium leading-tight", feature ? "font-display text-2xl font-semibold tracking-tight" : "text-sm")}>{c.name}</span>
                {subs.length > 0 && (
                  <span className={cn("mt-1 block text-xs", feature ? "text-accent-foreground/80" : "text-muted-foreground")}>
                    {feature ? subs.slice(0, 4).map((s) => s.name).join(" · ") : `${subs.length} subcategories`}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

/** Resolve the configured sections (or fall back to top-level categories). */
function useResolvedSections(): { title: string; category: Category; layout: "rail" | "tiles" }[] {
  const { categories, topCategories } = useCatalog();
  const settings = useStoreSettings();
  const configured: HomeSection[] | undefined = settings.data?.homeSections?.filter((s) => s.categorySlug);
  if (configured && configured.length > 0) {
    return configured
      .map((s) => {
        const category = categories.find((c) => c.slug === s.categorySlug);
        return category ? { title: s.title || category.name, category, layout: s.layout ?? "rail" } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }
  if (settings.loading) return [];
  return topCategories.map((c) => ({ title: c.name, category: c, layout: "rail" as const }));
}

const chipKeys = [...ACADEMIC_KEYS, ...ISLAMIC_KEYS];

export function CategorySections() {
  const sections = useResolvedSections();
  const { childrenOf } = useCatalog();
  return (
    <>
      {sections.map((s, idx) => {
        const subs = childrenOf(s.category.id);
        const showChips = subs.length > 0 && (s.layout === "tiles" || chipKeys.some((k) => s.category.slug.includes(k) || s.category.name.toLowerCase().includes(k)));
        return (
          <LazySection key={`${s.category.id}-${idx}`} minHeight={360}>
            {s.layout === "tiles" ? (
              <CategoryTilesSection title={s.title} category={s.category} subs={subs} />
            ) : (
              <QueryRailSection
                eyebrow="Category"
                title={s.title}
                href={`/category/${s.category.slug}`}
                query={{ categoryId: s.category.id, sort: "popularity" }}
                band={idx % 4 === 1}
              >
                {showChips && <SubcategoryChips subs={subs} />}
              </QueryRailSection>
            )}
          </LazySection>
        );
      })}
    </>
  );
}

function SubcategoryChips({ subs }: { subs: Category[] }) {
  return (
    <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mt-1 mb-5 flex gap-2 overflow-x-auto">
      {subs.map((s) => (
        <Link key={s.id} to={`/category/${s.slug}`} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          {s.name}
        </Link>
      ))}
    </div>
  );
}

function CategoryTilesSection({ title, category, subs }: { title: string; category: Category; subs: Category[] }) {
  const r = useBooks({ categoryId: category.id, sort: "popularity", pageSize: 6 });
  const books = r.data?.items ?? [];
  if (r.loading) return <Section><TileGridSkeleton count={6} /></Section>;
  if (r.error || books.length === 0) return null;
  return (
    <Section>
      <SectionHeader eyebrow="Category" title={title} href={`/category/${category.slug}`} />
      {subs.length > 0 && <SubcategoryChips subs={subs} />}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {books.map((b) => <BookCard key={b.id} book={b} compact />)}
      </div>
    </Section>
  );
}
