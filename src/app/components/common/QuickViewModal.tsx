// Renders the quick-view preview modal driven by QuickViewContext.

import { Link } from "@/lib/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { BookCover } from "./BookCover";
import { PriceTag } from "./PriceTag";
import { RatingStars } from "./RatingStars";
import { useQuickView } from "../../contexts/QuickViewContext";
import { useStore } from "../../contexts/StoreContext";
import { useCatalog } from "../../contexts/CatalogContext";

export function QuickViewModal() {
  const { book, close } = useQuickView();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { authorById, publisherById } = useCatalog();

  if (!book) return null;
  const authorName = book.authorIds.map((id) => authorById(id)?.name).filter(Boolean).join(", ");
  const publisher = publisherById(book.publisherId)?.name;
  const price = book.flashSale?.price ?? book.price;

  return (
    <Dialog open={!!book} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
          <div className="aspect-[2/3] sm:aspect-auto">
            <BookCover title={book.title} author={authorName} coverUrl={book.coverUrl} />
          </div>
          <div className="flex flex-col p-6">
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">{book.title}</DialogTitle>
            <DialogDescription className="mt-1 text-sm">
              {authorName}
              {publisher ? ` · ${publisher}` : ""}
            </DialogDescription>
            <div className="mt-3">
              <RatingStars value={book.ratingAvg} count={book.ratingCount} />
            </div>
            <div className="mt-3">
              <PriceTag price={price} oldPrice={book.oldPrice} size="lg" />
            </div>
            <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">{book.description}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Button className="gap-2" disabled={book.stock <= 0} onClick={() => { addToCart(book); close(); }}>
                <ShoppingCart size={16} /> Add to cart
              </Button>
              <Button variant="secondary" className="gap-2" onClick={() => toggleWishlist(book)}>
                <Heart size={16} fill={inWishlist(book.id) ? "currentColor" : "none"} /> Wishlist
              </Button>
              <Button variant="outline" asChild onClick={close}>
                <Link to={`/book/${book.slug}`}>View details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
