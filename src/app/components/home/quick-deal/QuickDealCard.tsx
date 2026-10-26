// Quick Deal card: a thin wrapper over the catalogue BookCard that swaps in the
// deal price, a campaign badge and a stock line.

import { BookCard } from "../../common/BookCard";
import type { Book, DealProduct, DealType } from "../../../../types";

const BADGE: Partial<Record<DealType, string>> = {
  BUY_ONE_GET_ONE: "Buy 1 Get 1",
  FREE_SHIPPING: "Free shipping",
  CLEARANCE_SALE: "Clearance",
};

export function QuickDealCard({ deal, book, type }: { deal: DealProduct; book: Book; type: DealType }) {
  const remaining = deal.stock_limit != null ? Math.max(0, deal.stock_limit - deal.sold_count) : null;
  const left = Math.min(book.stock, remaining ?? Number.POSITIVE_INFINITY);
  const outOfStock = book.stock <= 0 || remaining === 0;
  const stockNote = outOfStock ? "Out of stock" : left <= 10 ? `Only ${left} left` : "In stock";

  return (
    <BookCard
      book={book}
      priceOverride={{ price: deal.deal_price, oldPrice: deal.original_price }}
      badge={BADGE[type]}
      stockNote={stockNote}
      disableAdd={outOfStock}
      showDetails
    />
  );
}
