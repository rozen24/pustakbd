// Collection pages: category, author, publisher (each a filtered catalogue),
// the authors/publishers directories, and the search page.

import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "@/lib/navigation";
import { BookOpen, Building2, Search, UserRound } from "lucide-react";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { useCatalog } from "../../contexts/CatalogContext";
import { BookCover } from "../common/BookCover";
import { BookGridSkeleton } from "../common/Skeletons";
import { EmptyState } from "../common/EmptyState";
import { CatalogBrowser } from "../catalog/CatalogBrowser";
import { CONTAINER, ErrorState, Eyebrow, PageHeader, Breadcrumbs } from "../catalog/states";
import type { Author, Publisher } from "../../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className={cn(CONTAINER, "py-8")}>{children}</div>;
}

function HeroSkeleton() {
  return (
    <div className="mb-8 flex items-center gap-6 border-b border-border pb-8" aria-busy>
      <div className="h-28 w-28 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function NotFound({ what, to, label }: { what: string; to: string; label: string }) {
  return (
    <Shell>
      <EmptyState title={`${what} not found`} description="It may have been renamed or removed." action={<Button asChild><Link to={to}>{label}</Link></Button>} />
    </Shell>
  );
}

export function CategoryPage() {
  const { slug } = useParams();
  const { categoryById, childrenOf } = useCatalog();
  const catQ = useQuery(["category", slug], () => services.catalog.categoryBySlug(slug!), { enabled: !!slug });
  const cat = catQ.data;

  if (catQ.loading) return <Shell><HeroSkeleton /><BookGridSkeleton count={10} /></Shell>;
  if (catQ.error) return <Shell><ErrorState error={catQ.error} onRetry={catQ.refetch} /></Shell>;
  if (!cat) return <NotFound what="Category" to="/books" label="Browse all books" />;

  const parent = cat.parentId ? categoryById(cat.parentId) : undefined;
  const subs = childrenOf(cat.id);

  return (
    <Shell>
      <PageHeader
        crumbs={[{ label: "Home", to: "/" }, { label: "Books", to: "/books" }, ...(parent ? [{ label: parent.name, to: `/category/${parent.slug}` }] : []), { label: cat.name }]}
        eyebrow={parent ? parent.name : "Category"}
        title={cat.name}
        description={subs.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {subs.map((s) => (
              <Link key={s.id} to={`/category/${s.slug}`} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground hover:border-primary/40">{s.name}</Link>
            ))}
          </div>
        ) : `Browse every title in ${cat.name}.`}
      />
      <CatalogBrowser base={{ categoryId: cat.id }} hide={["category"]} subcategoryParentId={cat.id} emptyTitle={`No books in ${cat.name} yet`} />
    </Shell>
  );
}

export function AuthorPage() {
  const { slug } = useParams();
  const authorQ = useQuery(["author", slug], () => services.catalog.authorBySlug(slug!), { enabled: !!slug });
  const a = authorQ.data;

  if (authorQ.loading) return <Shell><HeroSkeleton /><BookGridSkeleton count={10} /></Shell>;
  if (authorQ.error) return <Shell><ErrorState error={authorQ.error} onRetry={authorQ.refetch} /></Shell>;
  if (!a) return <NotFound what="Author" to="/authors" label="All authors" />;

  return (
    <Shell>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Authors", to: "/authors" }, { label: a.name }]} className="mb-6" />
      <section className="mb-10 grid gap-6 rounded-lg border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border border-border bg-muted sm:mx-0">
          {a.photoUrl ? <BookCover title={a.name} coverUrl={a.photoUrl} /> : <div className="flex h-full items-center justify-center text-muted-foreground"><UserRound size={40} /></div>}
        </div>
        <div className="text-center sm:text-left">
          <Eyebrow>Author</Eyebrow>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{a.name}</h1>
          <p className="mt-1 text-sm tabular-nums text-muted-foreground">{a.bookCount} {a.bookCount === 1 ? "title" : "titles"} in our shop</p>
          {a.bio && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80">{a.bio}</p>}
        </div>
      </section>
      <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">Books by {a.name}</h2>
      <CatalogBrowser base={{ authorId: a.id }} hide={["author"]} emptyTitle="No books by this author yet" />
    </Shell>
  );
}

export function PublisherPage() {
  const { slug } = useParams();
  const pubQ = useQuery(["publisher", slug], () => services.catalog.publisherBySlug(slug!), { enabled: !!slug });
  const p = pubQ.data;

  if (pubQ.loading) return <Shell><HeroSkeleton /><BookGridSkeleton count={10} /></Shell>;
  if (pubQ.error) return <Shell><ErrorState error={pubQ.error} onRetry={pubQ.refetch} /></Shell>;
  if (!p) return <NotFound what="Publisher" to="/publishers" label="All publishers" />;

  return (
    <Shell>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Publishers", to: "/publishers" }, { label: p.name }]} className="mb-6" />
      <section className="mb-10 flex flex-col items-center gap-6 rounded-lg bg-accent p-8 text-center text-accent-foreground sm:flex-row sm:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-current/20 font-display text-4xl font-semibold">
          {p.name.charAt(0)}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-70">Publisher</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{p.name}</h1>
          <p className="mt-1 text-sm tabular-nums opacity-80">{p.bookCount} {p.bookCount === 1 ? "title" : "titles"} available</p>
        </div>
      </section>
      <CatalogBrowser base={{ publisherId: p.id }} hide={["publisher"]} emptyTitle="No titles from this publisher yet" />
    </Shell>
  );
}

function DirectorySearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
    </div>
  );
}

function useDirectory<T extends { name: string; bookCount: number }>(items: T[] | undefined, term: string) {
  return useMemo(() => {
    const t = term.trim().toLowerCase();
    return [...(items ?? [])].filter((i) => !t || i.name.toLowerCase().includes(t)).sort((a, b) => b.bookCount - a.bookCount);
  }, [items, term]);
}

function DirectorySkeleton({ round }: { round?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" aria-busy>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5">
          <div className={cn("h-20 w-20 animate-pulse bg-muted", round ? "rounded-full" : "rounded-lg")} />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function AuthorsListPage() {
  const q = useQuery(["catalog", "authors"], () => services.catalog.authors());
  const [term, setTerm] = useState("");
  const list = useDirectory<Author>(q.data, term);
  return (
    <Shell>
      <PageHeader
        crumbs={[{ label: "Home", to: "/" }, { label: "Authors" }]}
        eyebrow="Directory"
        title="Authors"
        description={q.data ? `${q.data.length} writers, ordered by number of titles.` : undefined}
        actions={<DirectorySearch value={term} onChange={setTerm} placeholder="Find an author" />}
      />
      {q.loading ? <DirectorySkeleton round /> : q.error ? <ErrorState error={q.error} onRetry={q.refetch} /> : list.length === 0 ? (
        <EmptyState icon={UserRound} title={term ? "No authors match" : "No authors yet"} description={term ? "Try a different spelling." : undefined} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list.map((a) => (
            <Link key={a.id} to={`/author/${a.slug}`} className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-muted">
                {a.photoUrl ? <BookCover title={a.name} coverUrl={a.photoUrl} /> : <div className="flex h-full items-center justify-center text-muted-foreground"><UserRound size={28} /></div>}
              </div>
              <div>
                <p className="font-display font-semibold leading-snug group-hover:text-primary">{a.name}</p>
                <p className="text-xs tabular-nums text-muted-foreground">{a.bookCount} books</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}

export function PublishersListPage() {
  const q = useQuery(["catalog", "publishers"], () => services.catalog.publishers());
  const [term, setTerm] = useState("");
  const list = useDirectory<Publisher>(q.data, term);
  return (
    <Shell>
      <PageHeader
        crumbs={[{ label: "Home", to: "/" }, { label: "Publishers" }]}
        eyebrow="Directory"
        title="Publishers"
        description={q.data ? `${q.data.length} publishing houses.` : undefined}
        actions={<DirectorySearch value={term} onChange={setTerm} placeholder="Find a publisher" />}
      />
      {q.loading ? <DirectorySkeleton /> : q.error ? <ErrorState error={q.error} onRetry={q.refetch} /> : list.length === 0 ? (
        <EmptyState icon={Building2} title={term ? "No publishers match" : "No publishers yet"} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {list.map((p) => (
            <Link key={p.id} to={`/publisher/${p.slug}`} className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary font-display text-xl font-semibold">{p.name.charAt(0)}</span>
              <div className="min-w-0">
                <p className="line-clamp-2 font-display font-semibold leading-snug group-hover:text-primary">{p.name}</p>
                <p className="text-xs tabular-nums text-muted-foreground">{p.bookCount} books</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const popular = useQuery(["search", "popular"], () => services.search.popular());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (input.trim()) next.set("q", input.trim()); else next.delete("q");
    next.delete("page");
    setParams(next);
  };

  return (
    <Shell>
      <PageHeader
        crumbs={[{ label: "Home", to: "/" }, { label: "Search" }]}
        eyebrow="Search"
        title={q ? <>Results for “{q}”</> : "Search the shop"}
        actions={
          <form onSubmit={submit} className="flex w-full gap-2 sm:w-96" role="search">
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Title, author, ISBN…" className="pl-9" aria-label="Search books" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        }
      />
      {popular.data && popular.data.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Popular</span>
          {popular.data.map((t) => (
            <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} onClick={() => setInput(t)} className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:border-primary/40">{t}</Link>
          ))}
        </div>
      )}
      {q ? (
        <CatalogBrowser base={{ search: q }} emptyTitle={`No results for “${q}”`} emptyDescription="Check the spelling, or try an author or category name." />
      ) : (
        <EmptyState icon={BookOpen} title="Start typing to search" description="Find books by title, author or category." />
      )}
    </Shell>
  );
}
