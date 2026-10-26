# Plan: Product Loop + Add-to-Cart Drawer

## Context

The Boierpata storefront has a working `BookCard` with wishlist, quick-view, and compare icon actions, plus a full-page `/cart` route. There is no slide-out cart drawer. The task is to add:
- An **Add to Cart icon** in the BookCard hover tray (below Compare)
- A **ShoppingCartDrawer** that opens from the right when a product is added
- **Image hover scale** on the cover thumbnail
- **Savings amount display** below the price
- **Tooltip labels** on the action icon buttons

All changes must extend existing systems — no duplicate cart logic, no new state libraries.

---

## Architecture Decision

`cartDrawerOpen` + `openCartDrawer` + `closeCartDrawer` will be added to the existing `StoreContext` (not a new context). Cart state already lives there, and `addToCart` will automatically open the drawer. This keeps the single `useStore()` call pattern intact everywhere.

---

## Files to Create

### `src/app/components/cart/ShoppingCartDrawer.tsx`

A new global drawer component using the existing shadcn/ui `Sheet` primitive (`side="right"`). Structure:

1. **Header** — "SHOPPING CART" title + `X` close button
2. **Free shipping progress** — same logic as `CartPage` (uses `useStoreSettings()` for `freeShippingThreshold`). Reuses `Progress` UI component. Dynamic message: "You're eligible for free shipping!" vs "Add {formatTk(toFree)} more for free shipping"
3. **Cart items** — for each item in `cart` + `bookCache`:
   - `BookCover` thumbnail (small, fixed size ~72px)
   - Title, author
   - `PriceTag` (size="sm")
   - `QuantityStepper` (already exists in `src/app/components/common/QuantityStepper.tsx`) wired to `setQty`
   - `Trash2` icon to `removeFromCart`
4. **"You may also like" recommendations** — horizontal scroll of up to 4 recently-viewed books from `recent + bookCache`, rendered as small BookCover links (not full BookCards to avoid nesting add-to-cart logic)
5. **Summary footer** — subtotal, savings (if > 0), total, "Taxes and shipping calculated at checkout" note
6. **Action buttons** — "VIEW CART" (Link to `/cart`) + "CHECK OUT" (Link to `/checkout`), using existing `Button` variants

Behavior handled automatically by Radix Sheet:
- Slide-in animation from right
- Dark overlay (backdrop)
- Click-outside closes
- ESC key closes
- Body scroll lock while open

Width: `w-[420px] max-w-[100vw]` on SheetContent (responsive automatically).

---

## Files to Modify

### 1. `src/app/contexts/StoreContext.tsx`

**Add to `StoreState` interface:**
```ts
cartDrawerOpen: boolean;
openCartDrawer(): void;
closeCartDrawer(): void;
```

**Add state in `StoreProvider`:**
```ts
const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
const openCartDrawer = useCallbackFn(() => setCartDrawerOpen(true));
const closeCartDrawer = useCallbackFn(() => setCartDrawerOpen(false));
```

**Modify `addToCart`** to open the drawer after adding:
```ts
const addToCart = useCallbackFn((book: Book, qty = 1) => {
  cache([book]);
  setCart(services.cart.add(book.id, qty));
  toast.success(`Added "${book.title}" to cart`);
  setCartDrawerOpen(true);
});
```

**Add to the `value` memo:** `cartDrawerOpen`, `openCartDrawer`, `closeCartDrawer`.

---

### 2. `src/app/components/common/BookCard.tsx`

**A. Image hover scale**

The image container (line 55) already has `overflow-hidden`. Wrap `BookCover` in a transitioning div:
```tsx
<div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
  <BookCover ... />
</div>
```
This keeps the cover from overflowing its container.

**B. Add "Add to Cart" icon to the hover tray** (lines 73–83)

Extract `openCartDrawer` from `useStore()`. Add a 4th `IconBtn` below the Compare button:
```tsx
<IconBtn label="Add to cart" onClick={(e) => { e.preventDefault(); addToCart(book); }}>
  <ShoppingCart size={15} />
</IconBtn>
```
`e.preventDefault()` prevents any parent Link from navigating. The `addToCart` call already opens the drawer via StoreContext.

**C. Tooltip wrapping for all four icon buttons**

Wrap each `IconBtn` call with `<Tooltip>`, `<TooltipTrigger asChild>`, `<TooltipContent>` from `../ui/tooltip`. Wrap the entire tray in `<TooltipProvider>`.

**D. Savings display**

Below `<PriceTag ...>` (line 99), when `pct > 0` and not compact:
```tsx
{pct > 0 && !compact && (
  <p className="mt-0.5 text-xs font-medium text-accent">
    Save {formatTk(oldPrice - price)} ({pct}% off)
  </p>
)}
```
`formatTk` is already imported (line 13 already imports `discountPercent`; add `formatTk` to the import).

---

### 3. `src/app/components/layout/RootLayout.tsx`

Import and mount `ShoppingCartDrawer` after `QuickViewModal`:
```tsx
import { ShoppingCartDrawer } from "../cart/ShoppingCartDrawer";

// In JSX:
<QuickViewModal />
<ShoppingCartDrawer />
```

---

## Reused Existing Code

| What | Where |
|---|---|
| `useStore()` — cart state and actions | `src/app/contexts/StoreContext.tsx` |
| `useStoreSettings()` — free shipping threshold | `src/app/components/product/useStoreSettings.ts` |
| `QuantityStepper` — qty +/− control | `src/app/components/common/QuantityStepper.tsx` |
| `BookCover` — cover image | `src/app/components/common/BookCover.tsx` |
| `PriceTag` — price + discount badge | `src/app/components/common/PriceTag.tsx` |
| `formatTk`, `discountPercent` | `src/lib/format.ts` |
| `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` | `src/app/components/ui/sheet.tsx` |
| `Progress` | `src/app/components/ui/progress.tsx` |
| `Button` | `src/app/components/ui/button.tsx` |
| `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent` | `src/app/components/ui/tooltip.tsx` |

---

## Verification

1. Run `npm run build` — confirm zero TypeScript errors
2. Hover over any BookCard:
   - Four icon buttons appear (wishlist, quick-view, compare, add-to-cart)
   - Tooltips show on hover for all four
   - Cover image scales to 1.05× without overflowing
3. Click Add to Cart icon:
   - No page navigation occurs
   - Cart drawer slides in from the right
   - Dark overlay appears
4. In drawer:
   - Free shipping progress bar reflects cart total
   - Quantity +/− updates subtotal and progress live
   - Trash removes the item
   - ESC or clicking overlay closes drawer
5. Discounted book cards show "Save ৳XXX (X% off)" in accent green
6. Mobile: drawer takes full viewport width, touch targets ≥ 44px
7. Navigate to `/cart` via "VIEW CART" — existing CartPage still works correctly
