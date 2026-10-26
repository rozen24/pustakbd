// Unified search: debounced grouped suggestions (books, authors, publishers,
// categories) from /search/suggest, popular searches when empty, and full
// keyboard navigation (arrow keys, Enter, Escape).

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Search, TrendingUp, X } from "lucide-react";
import { services } from "../../../services";
import { BookCover } from "../common/BookCover";
import { usePopularSearches } from "../common/useStoreSettings";
import { formatTk } from "../../../lib/format";
import type { Author, Book, Category, Publisher } from "../../../types";
import { cn } from "../ui/utils";

type Results = { books: Book[]; authors: Author[]; publishers: Publisher[]; categories: Category[] };
type Item = { key: string; group: string; label: string; href: string; book?: Book };
const EMPTY: Results = { books: [], authors: [], publishers: [], categories: [] };

export function SearchBar({ className, autoFocus, onNavigate }: { className?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const listId = useId();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>(EMPTY);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const { terms: popular } = usePopularSearches();
  const q = term.trim();

  useEffect(() => {
    if (q.length < 2) { setResults(EMPTY); setLoading(false); return; }
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(() => {
      services.search.suggest(q)
        .then((r) => { if (!cancelled) setResults({ books: r.books ?? [], authors: r.authors ?? [], publishers: r.publishers ?? [], categories: r.categories ?? [] }); })
        .catch((e) => console.error("Suggest failed:", e))
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items = useMemo<Item[]>(() => {
    if (q.length < 2) {
      return popular.slice(0, 8).map((p) => ({ key: `p-${p}`, group: "Popular searches", label: p, href: `/search?q=${encodeURIComponent(p)}` }));
    }
    return [
      ...results.books.slice(0, 5).map((b) => ({ key: `b-${b.id}`, group: "Books", label: b.title, href: `/book/${b.slug}`, book: b })),
      ...results.authors.slice(0, 4).map((a) => ({ key: `a-${a.id}`, group: "Authors", label: a.name, href: `/author/${a.slug}` })),
      ...results.publishers.slice(0, 4).map((p) => ({ key: `pu-${p.id}`, group: "Publishers", label: p.name, href: `/publisher/${p.slug}` })),
      ...results.categories.slice(0, 4).map((c) => ({ key: `c-${c.id}`, group: "Categories", label: c.name, href: `/category/${c.slug}` })),
    ];
  }, [q, results, popular]);

  useEffect(() => setActive(-1), [items]);

  const go = (href: string) => {
    navigate(href);
    setOpen(false);
    onNavigate?.();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(items[active].href);
    if (!q) return;
    go(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(-1, i - 1)); }
    else if (e.key === "Escape") { setOpen(false); setActive(-1); }
  };

  const showPanel = open && (q.length >= 2 || items.length > 0);
  let lastGroup = "";

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search" className="relative">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          autoFocus={autoFocus}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search books, authors, publishers…"
          aria-label="Search the store"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-24 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
        />
        {term && (
          <button type="button" aria-label="Clear search" onClick={() => { setTerm(""); setOpen(true); }} className="absolute right-[76px] top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        )}
        <button type="submit" className="absolute right-1 top-1 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          Search
        </button>
      </form>

      {showPanel && (
        <div id={listId} role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-sm">
          {q.length >= 2 && loading && items.length === 0 ? (
            <div className="space-y-2 p-3" aria-hidden>
              {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No matches for “{q}”. Press Enter to search all books.</p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {items.map((it, idx) => {
                const header = it.group !== lastGroup ? it.group : null;
                lastGroup = it.group;
                return (
                  <div key={it.key}>
                    {header && (
                      <p className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {header === "Popular searches" && <TrendingUp size={12} />}{header}
                      </p>
                    )}
                    <button
                      id={`${listId}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={idx === active}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(it.href)}
                      className={cn("flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm", idx === active ? "bg-muted" : "hover:bg-muted")}
                    >
                      {it.book && (
                        <span className="h-12 w-8 shrink-0 overflow-hidden rounded-[3px]">
                          <BookCover title={it.book.title} coverUrl={it.book.coverUrl} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      {it.book && <span className="tabular-nums text-muted-foreground">{formatTk(it.book.flashSale?.price ?? it.book.price)}</span>}
                    </button>
                  </div>
                );
              })}
              {q.length >= 2 && (
                <button type="button" onClick={() => go(`/search?q=${encodeURIComponent(q)}`)} className="mt-1 w-full rounded-md border-t border-border px-2 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted">
                  See all results for “{q}”
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
