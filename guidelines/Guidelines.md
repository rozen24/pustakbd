# Boierpata design guidelines

## Stance: editorial bookshop
The site should feel like a well-kept independent bookshop that also has the depth of a big online catalogue. The page is warm paper with deep ink text, and the books are the colour. Commit to this everywhere. Don't use SaaS gradients, blue accents or glassmorphism.

## Tokens (src/styles/theme.css)
- `bg-background` (#FAF7F2 paper) is the page ground. `bg-card` (white) is for panels, product cards and dashboards.
- `primary` (oxblood #9E2A2B) is for primary CTAs (Add to cart, Buy now), active nav, price emphasis and discount ribbons. Use it sparingly.
- `accent` (bottle green #1F4D3F) is for trust and positive signals: in stock, free delivery, verified, success. It also fills the dark campaign blocks.
- `secondary` and `muted` (#EFE9DF / #F1ECE4) are for chips, filter groups, section bands and skeletons.
- `border` is a hairline at 11% ink. Use rules and dividers rather than heavy shadows. The only shadow allowed is `shadow-sm`, on hover lift.
- Radius is 0.5rem. Book covers use `rounded-[3px]` with a subtle spine shadow, like real objects.
- Light and dark mode both come from tokens. Never hardcode hex values in components.

## Typography
- **Display:** Fraunces (`font-display`). Use it for page titles, section headings, book titles on the product page and big prices. Headings are weight 600 with tight tracking.
- **UI and body:** Figtree (`font-sans`, the default).
- **Bangla:** Hind Siliguri is the fallback in both stacks.
- Section headings follow the pattern: a small uppercase eyebrow (`text-[11px] tracking-[0.18em] text-muted-foreground`), then a Fraunces title, then a "View all →" link aligned right.
- Prices use `tabular-nums`. The current price is bold ink, the old price is `line-through text-muted-foreground`, and the discount is a `-23%` oxblood chip.

## Layout
- The container is `max-w-[1320px] mx-auto px-4 lg:px-6`.
- Homepage rails use horizontal scroll-snap with arrow buttons. Category tile grids are asymmetric where possible.
- Breakpoints: below 1024px, filters move into a Sheet. Below 768px, the bottom tab bar appears and the header condenses.
- Dashboards (seller and admin) use a left sidebar, a paper ground, white cards and dense tables with hairline rows.

## States
- Every async view shows three states: a skeleton (`bg-muted animate-pulse`), an EmptyState (icon, Fraunces line and CTA) and an error state (with retry).
- Focus rings are `ring-2 ring-ring/40`. Icon-only buttons need an aria-label.

## Honesty rule
Features with no backend are shown with a small "Coming soon" badge (`bg-secondary text-muted-foreground text-[10px] uppercase`) and are not interactive. Never fake data.

## Motion
Use `motion/react` sparingly: card hover lift (y -2), menu fade and slide (150ms) and drawer slides. Respect reduced motion.
