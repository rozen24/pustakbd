// Shared building blocks for homepage sections.

import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { SectionHeader } from "../common/SectionHeader";
import { BookRail } from "../common/BookRail";
import { SectionSkeleton } from "../common/Skeletons";
import { ErrorState } from "../common/EmptyState";
import type { Book, BookQuery } from "../../../types";
import { cn } from "../ui/utils";

export const CONTAINER = "mx-auto w-full max-w-[1320px] px-4 lg:px-6";

export function Section({ children, className, band = false, id }: { children: React.ReactNode; className?: string; band?: boolean; id?: string }) {
  return (
    <section id={id} className={cn(band ? "bg-secondary/60 py-12" : "py-8 md:py-10", className)}>
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

export function queryKey(q: BookQuery): string[] {
  return ["books", "home", JSON.stringify(q)];
}

export function useBooks(q: BookQuery, enabled = true) {
  return useQuery(queryKey(q), () => services.books.list(q), { enabled });
}

/** Rail section backed by a books.list query. Hidden when the query returns no books. */
export function QueryRailSection({
  eyebrow,
  title,
  subtitle,
  href,
  query,
  band,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  query: BookQuery;
  band?: boolean;
  /** Rendered between header and rail (e.g. subcategory chips). */
  children?: React.ReactNode;
}) {
  const r = useBooks({ pageSize: 12, ...query });
  return (
    <BooksRailSection eyebrow={eyebrow} title={title} subtitle={subtitle} href={href} band={band} books={r.data?.items} loading={r.loading} error={r.error} onRetry={r.refetch}>
      {children}
    </BooksRailSection>
  );
}

export function BooksRailSection({
  eyebrow, title, subtitle, href, band, books, loading, error, onRetry, children, action,
}: {
  eyebrow?: string; title: string; subtitle?: string; href?: string; band?: boolean;
  books?: Book[]; loading?: boolean; error?: Error | null; onRetry?: () => void;
  children?: React.ReactNode; action?: React.ReactNode;
}) {
  if (loading) return <Section band={band}><SectionSkeleton /></Section>;
  if (error) {
    return (
      <Section band={band}>
        <SectionHeader eyebrow={eyebrow} title={title} />
        <ErrorState compact onRetry={onRetry} />
      </Section>
    );
  }
  if (!books || books.length === 0) return null;
  return (
    <Section band={band}>
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} href={href} action={action} />
      {children}
      <BookRail books={books} />
    </Section>
  );
}

/** Parse a storefront href like "/books?flag=award&minDiscount=1" into a BookQuery. */
export function hrefToQuery(href: string | undefined): BookQuery | null {
  if (!href) return null;
  try {
    const u = new URL(href, "https://x.local");
    if (u.pathname !== "/books") return null;
    const p = u.searchParams;
    const q: BookQuery = {};
    const flag = p.get("flag");
    if (flag && ["bestseller", "new", "editors", "award", "flash"].includes(flag)) q.flag = flag as BookQuery["flag"];
    const sort = p.get("sort");
    if (sort && ["popularity", "newest", "price_asc", "price_desc", "rating", "discount"].includes(sort)) q.sort = sort as BookQuery["sort"];
    if (p.get("minDiscount")) q.minDiscount = Number(p.get("minDiscount"));
    if (p.get("categoryId")) q.categoryId = p.get("categoryId")!;
    return Object.keys(q).length ? q : null;
  } catch {
    return null;
  }
}
