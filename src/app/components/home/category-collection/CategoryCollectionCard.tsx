import { Link } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import { CategoryCollectionProduct } from "./CategoryCollectionProduct";
import type { CategoryCollection } from "../../../../types";

export function CategoryCollectionCard({ collection }: { collection: CategoryCollection }) {
  const { section, category, books } = collection;
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <header className="mb-3 min-w-0">
        <h3 className="truncate font-display text-lg font-semibold tracking-tight">{section.title}</h3>
        {section.subtitle && <p className="truncate text-xs text-muted-foreground">{section.subtitle}</p>}
      </header>
      <div className="grid grid-cols-2 gap-3">
        {books.slice(0, 4).map((b) => <CategoryCollectionProduct key={b.id} book={b} />)}
      </div>
      <Link
        to={`/category/${category.slug}`}
        className="mt-auto inline-flex items-center gap-1 self-start rounded pt-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        See More <ArrowRight size={14} aria-hidden />
      </Link>
    </article>
  );
}
