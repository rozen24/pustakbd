// Frequently-bought-together bundle: the current book plus up to three
// companions (from the real FBT endpoint), selectable, with a combined price
// and "Add all to cart".

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { Plus, ShoppingCart } from "lucide-react";
import { useStore } from "../../contexts/StoreContext";
import { BookCover } from "../common/BookCover";
import { formatTk } from "../../../lib/format";
import type { Book } from "../../../types";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

const priceOf = (b: Book) => b.flashSale?.price ?? b.price;

export function BundleBox({ book, companions }: { book: Book; companions: Book[] }) {
  const { addToCart } = useStore();
  const items = [book, ...companions.filter((c) => c.id !== book.id).slice(0, 3)];
  const [selected, setSelected] = useState<string[]>(() => items.filter((b) => b.stock > 0).map((b) => b.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelected(items.filter((b) => b.stock > 0).map((b) => b.id)), [book.id, companions.length]);

  const chosen = items.filter((b) => selected.includes(b.id));
  const total = chosen.reduce((s, b) => s + priceOf(b), 0);
  const listTotal = chosen.reduce((s, b) => s + Math.max(b.oldPrice || 0, priceOf(b)), 0);

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {items.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3">
              {i > 0 && <Plus size={16} className="text-muted-foreground" aria-hidden />}
              <Link
                  to={`/book/${b.slug}`}
                  className="block h-28 w-20 overflow-hidden rounded-[3px] shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-out hover:[&_img]:scale-105"
                  aria-label={b.title}
                >
                <BookCover title={b.title} coverUrl={b.coverUrl} />
              </Link>
            </div>
          ))}
        </div>
        <div className="w-full shrink-0 lg:w-64">
          <p className="text-sm text-muted-foreground">Total for {chosen.length} {chosen.length === 1 ? "item" : "items"}</p>
          <p className="font-display text-2xl font-semibold tabular-nums">{formatTk(total)}</p>
          {listTotal > total && <p className="text-xs tabular-nums text-muted-foreground"><span className="line-through">{formatTk(listTotal)}</span> · save {formatTk(listTotal - total)}</p>}
          <Button className="mt-3 w-full gap-2" disabled={chosen.length === 0} onClick={() => chosen.forEach((b) => addToCart(b))}>
            <ShoppingCart size={16} /> Add {chosen.length > 1 ? `all ${chosen.length}` : ""} to cart
          </Button>
        </div>
      </div>
      <ul className="mt-5 space-y-2 border-t border-border pt-4">
        {items.map((b, i) => (
          <li key={b.id} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-1 text-sm transition-colors duration-800 ease-in-out hover:bg-secondary/60">
            <Checkbox
              id={`fbt-${b.id}`}
              checked={selected.includes(b.id)}
              disabled={b.stock <= 0}
              onCheckedChange={(v) => setSelected((s) => (v ? [...s, b.id] : s.filter((x) => x !== b.id)))}
            />
            <label htmlFor={`fbt-${b.id}`} className="flex-1 cursor-pointer">
              {i === 0 && <span className="font-medium">This book: </span>}
              <span className={i === 0 ? "" : "transition-colors duration-200 ease-out hover:text-primary"}>{b.title}</span>
              {b.stock <= 0 && <span className="ml-2 text-xs text-destructive">Out of stock</span>}
            </label>
            <span className="tabular-nums">{formatTk(priceOf(b))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
