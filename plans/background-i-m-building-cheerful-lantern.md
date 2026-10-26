# Homepage: Quick Deal ⚡ and Category Collection Slider

## Context
The user wants two new data-driven homepage components, each managed by the admin:
1. A **Quick Deal** section with campaign tabs (Today's Deal, Buy 1 Get 1, Free Shipping, Best Price, Clearance Sale) above a product carousel.
2. A **Category Collection Slider**: a carousel of cards, each showing a category title, four books and "See More".

Both must use real data and come with admin CRUD, responsive carousels and loading, empty and error states.

**Architecture facts that change the brief's literal asks:**
- The app is a **Vite + React 18 SPA**, not Next.js. There are no Server Components and no `next/image`.
  - The equivalents: data comes from TanStack Query through `services`, rendered as `<img loading="lazy" decoding="async" srcSet/sizes>` via the existing `BookCover`.
  - Sections lazy-mount with the existing `LazySection` (IntersectionObserver).
  - Skeletons act as the Suspense fallback.
  - Data is fetched from **one aggregate endpoint per section**. Each endpoint returns only the books it displays, never the full catalog.
- The backend is a **single KV table**, not SQL, so the brief's "tables" become KV record types with exactly the requested fields.
  - The "indexes" are key design. A campaign is stored at `deal_campaign:{id}`, and its products at `deal_product:{campaignId}:{id}`, so one campaign's products are read with a single prefix scan.
  - Section items work the same way under `home_cat_item:{sectionId}:{id}`.
- **Security gap found:** `POST /orders` stores client-sent prices and totals as-is. Deal prices would be trivially spoofable. Fix it as part of this work by recomputing item prices, shipping and totals on the server.

Screenshots were referenced in the request but none were attached, so the layout follows the written spec.

## Data model (KV, in `supabase/functions/server/index.tsx`)
- **`deal_campaign:{id}`**
  - Fields: `{id, name, slug, type, description, banner, is_active, start_at, end_at, display_order, created_at, updated_at}`
  - `type` is one of `TODAYS_DEAL | BUY_ONE_GET_ONE | FREE_SHIPPING | BEST_PRICE | CLEARANCE_SALE`.
- **`deal_product:{campaign_id}:{id}`**
  - Fields: `{id, campaign_id, product_id, original_price, deal_price, discount_percentage, stock_limit, sold_count, display_order, is_active}`
  - `discount_percentage` is computed on the server.
- **`home_cat_section:{id}`**: `{id, title, subtitle, category_id, display_order, is_active}`
- **`home_cat_item:{section_id}:{id}`**: `{id, section_id, product_id, display_order}`
- Add these fields to `src/types/index.ts`, along with the response types `DealTab` and `CategoryCollection`.

## Endpoints
**Public**
- **`GET /home/quick-deals?limit=12`** returns `[{campaign, items:[{deal, book}]}]`.
  - Campaigns are included only if `is_active`, `start_at <= now`, and `end_at` is either missing or in the future.
  - They are sorted by `display_order`, with at most one tab per type in the order requested.
  - Each campaign's items are limited to active rows with the book published. A row whose `stock_limit` is set and `sold_count >= stock_limit` is dropped.
  - Out-of-stock books (`stock <= 0`) are kept but sorted last, and the card shows "Out of stock" with Add to Cart disabled.
  - Books are loaded with `kv.mget`, so only the books displayed are read.
- **`GET /home/category-collections`** returns `[{section, category, books: Book[≤4]}]`.
  - Only active sections are included, sorted.
  - It uses curated items when there are any. Otherwise it fills from the category's top books, capped at 4, so a new section isn't empty.
  - Sections with zero books are omitted.

**Admin** (`requireAdmin`)
- `GET`, `POST`, `PUT` and `DELETE` on `/admin/deal-campaigns`, plus `PUT /admin/deal-campaigns/reorder`.
- `GET` `/admin/deal-campaigns/:id/products` and `POST`/`PUT`/`DELETE` `/admin/deal-products`.
  - Validation: `deal_price` must be greater than 0. For non-BOGO and non-free-shipping types it must also be below `original_price`, which is snapshotted from the book.
  - Deleting a campaign also deletes its products, using the prefix.
- `GET`, `POST`, `PUT` and `DELETE` on `/admin/home-sections`, plus `/reorder`, and `PUT /admin/home-sections/:id/items` to replace the ordered product list (maximum 8).

**Order pricing hardening** (inside the existing `POST /orders`)
- Recompute each line's price from the book's price, then any active flash sale, then any live `deal_product`, whichever is lowest.
- Buy 1 Get 1: charge `ceil(qty / 2)` units.
- Free shipping: if every item is in a live free-shipping campaign, shipping is 0.
- Re-validate the coupon, reusing the existing coupon validate logic.
- Increment `sold_count` on the deal rows.
- The response shape is unchanged.

**Client.** Add `services.deals` (`quickDeals`, plus the admin methods) and `services.homeSections` (`collections`, plus the admin methods) in `repositories.ts` and `supabase-repositories.ts`. `src/services/index.ts` stays the only swap point.

## Components (`src/app/components/home/`)
**Quick Deal** (`quick-deal/`)
- **`QuickDeal.tsx`** is the container. It runs the query and renders the bordered section with a primary-colour header bar showing "Quick Deal ⚡" and the tabs. It handles the skeleton, error with retry, and the empty case by hiding the whole section.
- **`QuickDealTabs.tsx`** uses Radix Tabs. It renders only the campaigns that are live, has an active highlight, and scrolls horizontally on mobile without overflowing the page. It also shows a countdown when `end_at` is set.
- **`QuickDealCarousel.tsx`** uses `embla-carousel-react`, which is already a dependency via `ui/carousel.tsx`.
  - Slides are `basis-1/2 md:basis-1/3 lg:basis-1/5`.
  - It has previous/next arrows, touch swipe, and left/right arrow keys on the focused region with `aria-roledescription="carousel"`.
  - Slides are wrapped in `overflow-hidden` so the page never scrolls sideways.
- **`QuickDealCard.tsx`** is a thin wrapper around the existing `BookCard` (`common/BookCard.tsx`), passing new optional props `priceOverride`, `badge` and `stockNote` so the cart and wishlist logic isn't duplicated.
  - It shows the deal price, the original price and the discount percentage.
  - The badge reads "Buy 1 Get 1", "Free shipping" or "Clearance".
  - The stock line reads "Only N left" when below the limit.
  - It has View Details plus the existing Add to Cart and Wishlist.

**Category Collection** (`category-collection/`)
- **`CategoryCollectionSlider.tsx`** is the embla carousel of cards: `basis-[88%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4`, with arrows, swipe and keyboard support.
- **`CategoryCollectionCard.tsx`** is a white card with a subtle border and soft shadow, holding the title and subtitle, a 2×2 grid of products, and "See More →" linking to `/category/:slug`.
- **`CategoryCollectionProduct.tsx`** shows a cover via `BookCover` with lazy loading, plus a two-line clamped title, linking to `/book/:slug`.

**Shared:** extract a small `useEmblaControls` hook for the arrow and keyboard state, used by both carousels.

## Homepage integration (`pages/HomePage.tsx`)
- Insert `<QuickDeal/>` right after `FlashSale`, eagerly loaded since it is near the top.
- Insert `<LazySection><CategoryCollectionSlider/></LazySection>` after Best Sellers, before the per-category rails.

## Admin (`components/admin/home-pages.tsx`, plus routes and nav in `router.tsx` and `layout/dashboards.tsx` under "Storefront")
- **Quick Deals page**
  - A campaign table with type, schedule, an active switch, up/down reorder, and edit and delete through the existing `ConfirmDelete`.
  - A campaign editor dialog with name, slug, type, description, banner upload (existing `uploadImage`), start/end datetimes and active.
  - A product manager sheet: search books with `services.books.list({search, pageSize:10})`, add a book with a deal price and stock limit, and reorder, toggle or remove rows. `sold_count` is read-only.
- **Home Collections page**
  - A section list with an active switch and reorder.
  - An editor with title, subtitle and a category select.
  - A product picker scoped to the chosen category, with reorder (up/down) and a limit of 8.
- Reuse the `admin/kit.tsx` pieces: `PageHeader`, `Panel`, `DataTable`, `Pill`, `ConfirmDelete`, `ErrorState` and the skeletons.

## Bengali support
Both Fraunces and Figtree already fall back to Hind Siliguri. Add `lang`-agnostic `font-sans` on the product titles, and set `leading-snug` so Bengali conjuncts aren't clipped.

## Verification
- `npm run build`. Note that the environment currently lacks a Node shim; if it is still blocked, ask the user to run `mise use -g node@22.23.2`.
- Redeploy the edge function.
- As admin:
  - Create a Today's Deal campaign and add 6 books with deal prices.
  - Create an expired campaign and an inactive campaign, and confirm neither appears.
  - Create two collection sections, one curated and one auto-filled.
- On the homepage at 375px, 768px and 1280px, check:
  - about 2, 3 and 5 cards per view, and about 1 / 2 / 3–4 collection cards
  - swipe, the arrows and the arrow keys
  - no horizontal page overflow (`document.documentElement.scrollWidth === innerWidth`)
- Order integrity: send a manipulated price to `POST /orders` and confirm the server recomputes it. Confirm BOGO halves the charged units, free shipping zeroes shipping, and `sold_count` increments.
