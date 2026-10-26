// Reusable, URL-synced catalogue browser: filter sidebar (Sheet on mobile),
// active filter chips, sort, grid/list toggle and server-side pagination.
// Used by /books, category, author, publisher and search pages.

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { LayoutGrid, List, SearchX, SlidersHorizontal, Star, X } from "lucide-react";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { useCatalog } from "../../contexts/CatalogContext";
import { BookCard } from "../common/BookCard";
import { BookCover } from "../common/BookCover";
import { PriceTag } from "../common/PriceTag";
import { RatingStars } from "../common/RatingStars";
import { BookGridSkeleton } from "../common/Skeletons";
import { EmptyState } from "../common/EmptyState";
import { formatTk } from "../../../lib/format";
import type { Book, BookQuery } from "../../../types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "../ui/pagination";
import { cn } from "../ui/utils";
import { ErrorState } from "./states";

export const CATALOG_SORTS: { value: NonNullable<BookQuery["sort"]>; label: string }[] = [
  { value: "popularity", label: "Most popular" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
];

const LANGUAGES: NonNullable<BookQuery["language"]>[] = ["Bangla", "English", "Arabic", "Hindi"];
const BINDINGS: NonNullable<BookQuery["binding"]>[] = ["Hardcover", "Paperback"];
const DISCOUNTS = [10, 20, 30, 50];
const FLAGS: Record<string, string> = { bestseller: "Bestsellers", new: "New arrivals", editors: "Editor's choice", award: "Award winners", flash: "Flash sale" };
const PRICE_MAX = 3000;
const PAGE_SIZE = 24;

type FilterKey = "category" | "author" | "publisher";

const num = (v: string | null) => (v ? Number(v) : undefined);

export function CatalogBrowser({
  base = {},
  hide = [],
  subcategoryParentId,
  enabled = true,
  emptyTitle = "No books match these filters",
  emptyDescription = "Try removing a filter or broadening your search.",
}: {
  base?: Partial<BookQuery>;
  hide?: FilterKey[];
  subcategoryParentId?: string;
  enabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [params, setParams] = useSearchParams();
  const { categories, authors, publishers, categoryById, authorById, publisherById, childrenOf } = useCatalog();
  const [sheetOpen, setSheetOpen] = useState(false);

  const query: BookQuery = useMemo(() => ({
    ...base,
    search: params.get("q") || base.search || undefined,
    categoryId: params.get("categoryId") || base.categoryId,
    authorId: params.get("authorId") || base.authorId,
    publisherId: params.get("publisherId") || base.publisherId,
    language: (params.get("language") as BookQuery["language"]) || undefined,
    binding: (params.get("binding") as BookQuery["binding"]) || undefined,
    minPrice: num(params.get("minPrice")),
    maxPrice: num(params.get("maxPrice")),
    minRating: num(params.get("minRating")),
    minDiscount: num(params.get("minDiscount")),
    inStock: params.get("inStock") === "1" || undefined,
    flag: (params.get("flag") as BookQuery["flag"]) || base.flag,
    sort: (params.get("sort") as BookQuery["sort"]) || base.sort || "popularity",
    page: Math.max(1, num(params.get("page")) ?? 1),
    pageSize: PAGE_SIZE,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [params, JSON.stringify(base)]);

  const view = params.get("view") === "list" ? "list" : "grid";
  const result = useQuery(["books", "browse", JSON.stringify(query)], () => services.books.list(query), { enabled });

  const set = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
    if (key !== "page" && key !== "view") next.delete("page");
    setParams(next);
  };
  const setMany = (entries: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(entries).forEach(([k, v]) => (v === undefined || v === "" ? next.delete(k) : next.set(k, v)));
    next.delete("page");
    setParams(next);
  };
  const toggle = (key: string, value: string) => set(key, params.get(key) === value ? undefined : value);

  const total = result.data?.total ?? 0;
  const page = query.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Scroll to top on page change.
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  // --- Active chips -------------------------------------------------------
  const chips: { label: string; clear: () => void }[] = [];
  const q = params.get("q");
  if (q && !base.search) chips.push({ label: `“${q}”`, clear: () => set("q") });
  const cId = params.get("categoryId");
  if (cId) chips.push({ label: categoryById(cId)?.name ?? "Category", clear: () => set("categoryId") });
  const aId = params.get("authorId");
  if (aId) chips.push({ label: authorById(aId)?.name ?? "Author", clear: () => set("authorId") });
  const pId = params.get("publisherId");
  if (pId) chips.push({ label: publisherById(pId)?.name ?? "Publisher", clear: () => set("publisherId") });
  if (query.language) chips.push({ label: query.language, clear: () => set("language") });
  if (query.binding) chips.push({ label: query.binding, clear: () => set("binding") });
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    chips.push({ label: `${formatTk(query.minPrice ?? 0)} – ${query.maxPrice !== undefined ? formatTk(query.maxPrice) : "any"}`, clear: () => setMany({ minPrice: undefined, maxPrice: undefined }) });
  }
  if (query.minRating) chips.push({ label: `${query.minRating}★ & up`, clear: () => set("minRating") });
  if (query.minDiscount) chips.push({ label: `${query.minDiscount}%+ off`, clear: () => set("minDiscount") });
  if (query.inStock) chips.push({ label: "In stock", clear: () => set("inStock") });
  const flagParam = params.get("flag");
  if (flagParam) chips.push({ label: FLAGS[flagParam] ?? flagParam, clear: () => set("flag") });

  const clearAll = () => {
    const next = new URLSearchParams();
    const keep = ["sort", "view"];
    if (base.search) keep.push("q");
    keep.forEach((k) => { const v = params.get(k); if (v) next.set(k, v); });
    setParams(next);
  };

  // --- Filter panel -------------------------------------------------------
  const subParent = subcategoryParentId ?? (query.categoryId ? (categoryById(query.categoryId)?.parentId ?? query.categoryId) : undefined);
  const subcats = subParent ? childrenOf(subParent) : [];
  const topCats = categories.filter((c) => !c.parentId);

  const filters = (
    <div className="divide-y divide-border">
      {!hide.includes("category") && (
        <FilterGroup title={subcats.length ? "Subcategories" : "Category"}>
          {(subcats.length ? subcats : topCats).map((c) => (
            <FilterRow key={c.id} checked={params.get("categoryId") === c.id} onClick={() => toggle("categoryId", c.id)} label={c.name} />
          ))}
          {subcats.length === 0 && topCats.length === 0 && <p className="text-xs text-muted-foreground">No categories yet.</p>}
        </FilterGroup>
      )}
      {hide.includes("category") && subcats.length > 0 && (
        <FilterGroup title="Subcategories">
          {subcats.map((c) => (
            <FilterRow key={c.id} checked={params.get("categoryId") === c.id} onClick={() => toggle("categoryId", c.id)} label={c.name} />
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Price">
        <PriceRange
          min={query.minPrice ?? 0}
          max={query.maxPrice ?? PRICE_MAX}
          onCommit={(lo, hi) => setMany({ minPrice: lo > 0 ? String(lo) : undefined, maxPrice: hi < PRICE_MAX ? String(hi) : undefined })}
        />
      </FilterGroup>
      <FilterGroup title="Customer rating">
        {[4, 3, 2].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => toggle("minRating", String(r))}
            aria-pressed={query.minRating === r}
            className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", query.minRating === r && "bg-secondary font-medium")}
          >
            <span className="flex text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < r ? "currentColor" : "none"} className={i < r ? "" : "text-muted-foreground/40"} />)}</span>
            & up
          </button>
        ))}
      </FilterGroup>
      <FilterGroup title="Availability & offers">
        <label className="flex cursor-pointer items-center gap-2 px-1 py-1 text-sm">
          <Checkbox checked={!!query.inStock} onCheckedChange={(v) => set("inStock", v ? "1" : undefined)} />
          In stock only
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DISCOUNTS.map((d) => (
            <Pill key={d} active={query.minDiscount === d} onClick={() => toggle("minDiscount", String(d))}>{d}%+ off</Pill>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Language">
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => <Pill key={l} active={query.language === l} onClick={() => toggle("language", l)}>{l}</Pill>)}
        </div>
      </FilterGroup>
      <FilterGroup title="Binding">
        <div className="flex flex-wrap gap-1.5">
          {BINDINGS.map((b) => <Pill key={b} active={query.binding === b} onClick={() => toggle("binding", b)}>{b}</Pill>)}
        </div>
      </FilterGroup>
      {!hide.includes("author") && authors.length > 0 && (
        <FilterGroup title="Author">
          <ScrollList>
            {authors.map((a) => <FilterRow key={a.id} checked={params.get("authorId") === a.id} onClick={() => toggle("authorId", a.id)} label={a.name} />)}
          </ScrollList>
        </FilterGroup>
      )}
      {!hide.includes("publisher") && publishers.length > 0 && (
        <FilterGroup title="Publisher">
          <ScrollList>
            {publishers.map((p) => <FilterRow key={p.id} checked={params.get("publisherId") === p.id} onClick={() => toggle("publisherId", p.id)} label={p.name} />)}
          </ScrollList>
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-border bg-card px-4 py-2">
          <div className="flex items-center justify-between py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Refine</p>
            {chips.length > 0 && <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear all</button>}
          </div>
          {filters}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {result.loading ? "Loading…" : result.error ? "" : (
              <><span className="font-medium tabular-nums text-foreground">{total.toLocaleString()}</span> {total === 1 ? "book" : "books"}{totalPages > 1 && <> · page {page} of {totalPages}</>}</>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                  <SlidersHorizontal size={15} /> Filters
                  {chips.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground tabular-nums">{chips.length}</span>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                <SheetHeader><SheetTitle className="font-display">Filters</SheetTitle></SheetHeader>
                <div className="px-4">{filters}</div>
                <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-border bg-background p-4">
                  <Button variant="outline" className="flex-1" onClick={clearAll}>Clear</Button>
                  <Button className="flex-1" onClick={() => setSheetOpen(false)}>Show {total} results</Button>
                </div>
              </SheetContent>
            </Sheet>
            <Select value={query.sort} onValueChange={(v) => set("sort", v)}>
              <SelectTrigger className="h-9 w-48" aria-label="Sort by"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATALOG_SORTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="hidden rounded-md border border-border bg-card sm:flex">
              <button aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => set("view", undefined)} className={cn("flex h-9 w-9 items-center justify-center", view === "grid" ? "text-primary" : "text-muted-foreground hover:text-foreground")}><LayoutGrid size={16} /></button>
              <button aria-label="List view" aria-pressed={view === "list"} onClick={() => set("view", "list")} className={cn("flex h-9 w-9 items-center justify-center border-l border-border", view === "list" ? "text-primary" : "text-muted-foreground hover:text-foreground")}><List size={16} /></button>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40" aria-label={`Remove filter ${c.label}`}>
                {c.label} <X size={12} />
              </button>
            ))}
            <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear all</button>
          </div>
        )}

        {result.loading || !enabled ? (
          <BookGridSkeleton count={12} />
        ) : result.error ? (
          <ErrorState error={result.error} onRetry={result.refetch} title="Couldn't load books" />
        ) : !result.data || result.data.items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={emptyTitle}
            description={emptyDescription}
            action={chips.length > 0 ? <Button variant="outline" onClick={clearAll}>Clear filters</Button> : <Button asChild><Link to="/books">Browse all books</Link></Button>}
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {result.data.items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {result.data.items.map((b) => <BookListRow key={b.id} book={b} />)}
          </div>
        )}

        {!result.loading && totalPages > 1 && (
          <PageNav page={page} totalPages={totalPages} onChange={(p) => set("page", p === 1 ? undefined : String(p))} />
        )}
      </div>
    </div>
  );
}

function pageWindow(page: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const add = (n: number | "…") => out.push(n);
  const lo = Math.max(2, page - 1);
  const hi = Math.min(total - 1, page + 1);
  add(1);
  if (lo > 2) add("…");
  for (let i = lo; i <= hi; i++) add(i);
  if (hi < total - 1) add("…");
  if (total > 1) add(total);
  return out;
}

export function PageNav({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const go = (p: number) => (e: React.MouseEvent) => { e.preventDefault(); if (p >= 1 && p <= totalPages && p !== page) onChange(p); };
  return (
    <Pagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={page <= 1} className={cn(page <= 1 && "pointer-events-none opacity-40")} />
        </PaginationItem>
        {pageWindow(page, totalPages).map((p, i) => (
          <PaginationItem key={i}>
            {p === "…" ? <PaginationEllipsis /> : (
              <PaginationLink href="#" isActive={p === page} onClick={go(p)} className="tabular-nums">{p}</PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={page >= totalPages} className={cn(page >= totalPages && "pointer-events-none opacity-40")} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function PriceRange({ min, max, onCommit }: { min: number; max: number; onCommit: (lo: number, hi: number) => void }) {
  const [val, setVal] = useState<[number, number]>([min, Math.min(max, PRICE_MAX)]);
  useEffect(() => { setVal([min, Math.min(max, PRICE_MAX)]); }, [min, max]);
  return (
    <div className="px-1 pt-2">
      <Slider
        min={0}
        max={PRICE_MAX}
        step={50}
        value={val}
        onValueChange={(v) => setVal([v[0], v[1]] as [number, number])}
        onValueCommit={(v) => onCommit(v[0], v[1])}
        aria-label="Price range"
      />
      <div className="mt-3 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>{formatTk(val[0])}</span>
        <span>{val[1] >= PRICE_MAX ? `${formatTk(PRICE_MAX)}+` : formatTk(val[1])}</span>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="py-4">
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      <div className="flex flex-col gap-0.5">{children}</div>
    </fieldset>
  );
}

function ScrollList({ children }: { children: React.ReactNode }) {
  return <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto pr-1">{children}</div>;
}

function FilterRow({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onClick(); } }}
      className={cn("flex items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", checked ? "text-foreground" : "text-muted-foreground")}
    >
      <Checkbox checked={checked} tabIndex={-1} aria-hidden className="pointer-events-none" />
      <span className="line-clamp-1">{label}</span>
    </div>

  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn("rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/40")}
    >
      {children}
    </button>
  );
}

function BookListRow({ book }: { book: Book }) {
  const { authorById } = useCatalog();
  const author = book.authorIds.map((id) => authorById(id)?.name).filter(Boolean).join(", ");
  const price = book.flashSale?.price ?? book.price;
  return (
    <div className="flex gap-5 p-4">
      <Link to={`/book/${book.slug}`} className="h-40 w-28 shrink-0 overflow-hidden rounded-[3px] shadow-sm">
        <BookCover title={book.title} author={author} coverUrl={book.coverUrl} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link to={`/book/${book.slug}`}><h3 className="font-display text-lg font-semibold leading-snug tracking-tight hover:text-primary">{book.title}</h3></Link>
        <p className="text-sm text-muted-foreground">{author}</p>
        <div className="mt-1"><RatingStars value={book.ratingAvg} count={book.ratingCount} /></div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{book.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <PriceTag price={price} oldPrice={book.oldPrice} />
          <span className={cn("text-xs", book.stock > 0 ? "text-accent" : "text-destructive")}>{book.stock > 0 ? "In stock" : "Out of stock"}</span>
        </div>
      </div>
    </div>
  );
}
