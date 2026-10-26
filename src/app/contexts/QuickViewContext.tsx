"use client";

// Quick-view context: lets any book card open a lightweight preview modal
// without navigating away. The modal UI itself lives in the layout so it can
// sit above all routes.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Book } from "../../types";

interface QuickViewState {
  book: Book | null;
  open(book: Book): void;
  close(): void;
}

const QuickViewContext = createContext<QuickViewState | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [book, setBook] = useState<Book | null>(null);
  const open = useCallback((b: Book) => setBook(b), []);
  const close = useCallback(() => setBook(null), []);
  const value = useMemo(() => ({ book, open, close }), [book, open, close]);
  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView(): QuickViewState {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}
