"use client";

// Catalog context: loads the relatively static catalog metadata (categories,
// authors, publishers, sellers, banners) once and exposes lookup helpers used
// across the header mega-menu, book cards, and detail pages.

import { createContext, useContext, useMemo } from "react";
import { useQuery } from "../../lib/query";
import { services } from "../../services";
import type { Author, Banner, Category, Publisher, Seller } from "../../types";

interface CatalogState {
  categories: Category[];
  topCategories: Category[];
  authors: Author[];
  publishers: Publisher[];
  sellers: Seller[];
  banners: Banner[];
  loading: boolean;
  categoryById(id: string): Category | undefined;
  authorById(id: string): Author | undefined;
  publisherById(id: string): Publisher | undefined;
  sellerById(id: string): Seller | undefined;
  childrenOf(id: string): Category[];
}

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const cats = useQuery(["catalog", "categories"], () => services.catalog.categories());
  const authors = useQuery(["catalog", "authors"], () => services.catalog.authors());
  const publishers = useQuery(["catalog", "publishers"], () => services.catalog.publishers());
  const sellers = useQuery(["catalog", "sellers"], () => services.catalog.sellers());
  const banners = useQuery(["catalog", "banners"], () => services.catalog.banners());

  const value = useMemo<CatalogState>(() => {
    const categories = cats.data ?? [];
    const authorList = authors.data ?? [];
    const publisherList = publishers.data ?? [];
    const sellerList = sellers.data ?? [];
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const authorMap = new Map(authorList.map((a) => [a.id, a]));
    const pubMap = new Map(publisherList.map((p) => [p.id, p]));
    const sellerMap = new Map(sellerList.map((s) => [s.id, s]));
    return {
      categories,
      topCategories: categories.filter((c) => !c.parentId),
      authors: authorList,
      publishers: publisherList,
      sellers: sellerList,
      banners: banners.data ?? [],
      loading: cats.loading || authors.loading || publishers.loading,
      categoryById: (id) => catMap.get(id),
      authorById: (id) => authorMap.get(id),
      publisherById: (id) => pubMap.get(id),
      sellerById: (id) => sellerMap.get(id),
      childrenOf: (id) => categories.filter((c) => c.parentId === id),
    };
  }, [cats.data, cats.loading, authors.data, authors.loading, publishers.data, publishers.loading, sellers.data, banners.data]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
