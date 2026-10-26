// Catalogue browser (/books). Filter/sort/paging state lives in the URL via
// CatalogBrowser so views are shareable.

import { useSearchParams } from "@/lib/navigation";
import { CatalogBrowser } from "../catalog/CatalogBrowser";
import { CONTAINER, PageHeader } from "../catalog/states";
import { cn } from "../ui/utils";

const FLAG_TITLES: Record<string, { title: string; eyebrow: string }> = {
  bestseller: { title: "Bestsellers", eyebrow: "What readers are buying" },
  new: { title: "New arrivals", eyebrow: "Fresh off the press" },
  editors: { title: "Editor's choice", eyebrow: "Picked by our team" },
  award: { title: "Award winners", eyebrow: "Celebrated titles" },
  flash: { title: "Flash sale", eyebrow: "Limited-time prices" },
};

export default function CatalogPage({ heading }: { heading?: string }) {
  const [params] = useSearchParams();
  const flag = params.get("flag");
  const meta = flag ? FLAG_TITLES[flag] : undefined;
  const offers = !!params.get("minDiscount") && !flag;
  const title = heading ?? meta?.title ?? (offers ? "Offers & discounts" : "All books");
  const eyebrow = meta?.eyebrow ?? (offers ? "Save on great reads" : "The catalogue");

  return (
    <div className={cn(CONTAINER, "py-8")}>
      <PageHeader
        crumbs={[{ label: "Home", to: "/" }, { label: "Books", to: flag || offers ? "/books" : undefined }, ...(flag || offers ? [{ label: title }] : [])]}
        eyebrow={eyebrow}
        title={title}
        description="Filter by price, rating, language and more. Every filter is saved in the link, so you can share what you find."
      />
      <CatalogBrowser />
    </div>
  );
}
