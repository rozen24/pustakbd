"use client";

// Categories mega-menu: opens on hover or click, keyboard accessible
// (Escape closes, arrow keys move between top categories), sourced from the catalog.

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link } from "@/lib/navigation";
import { ChevronDown, ChevronRight, LayoutGrid, BookOpen } from "lucide-react";
import * as Icons from "lucide-react";
import { useCatalog } from "../../contexts/CatalogContext";
import { cn } from "../ui/utils";

type MegaMenuProps = {
  variant?: "primary" | "link";
};

export function MegaMenu({ variant = "primary" }: MegaMenuProps) {
  const { topCategories, childrenOf } = useCatalog();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCat =
    topCategories.find((category) => category.id === active) ??
    topCategories[0];

  const subs = activeCat ? childrenOf(activeCat.id) : [];

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();

    closeTimer.current = setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 150);
  }, [clearCloseTimer]);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);

    if (!active && topCategories.length > 0) {
      setActive(topCategories[0].id);
    }
  }, [active, clearCloseTimer, topCategories]);

  // Close the menu when clicking outside.
  useEffect(() => {
    if (!open) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        closeMenu();
      }
    };

    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [open, closeMenu]);

  // Clear pending timers when the component unmounts.
  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
      return;
    }

    if (!open || topCategories.length === 0) return;

    const currentIndex = topCategories.findIndex(
      (category) => category.id === activeCat?.id,
    );

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + topCategories.length) %
        topCategories.length;

      setActive(topCategories[nextIndex].id);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActive(topCategories[0].id);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActive(topCategories[topCategories.length - 1].id);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="categories-mega-menu"
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onFocus={() => {
          // Keep the menu available for keyboard users.
          if (open) clearCloseTimer();
        }}
        className={cn(
          "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          variant === "primary"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-foreground hover:text-primary",
        )}
      >
        <LayoutGrid size={16} aria-hidden="true" />
        Categories
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && topCategories.length > 0 && (
        <div
          id="categories-mega-menu"
          className="absolute left-0 top-full z-50 mt-1 grid w-[min(720px,calc(100vw-2rem))] grid-cols-[minmax(180px,240px)_minmax(0,1fr)] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-lg border border-border bg-popover shadow-sm duration-150"
        >
          {/* Top-level categories */}
          <ul
            className="max-h-[60vh] overflow-y-auto border-r border-border bg-secondary/50 p-2"
            aria-label="Categories"
            role="menu"
          >
            {topCategories.map((category) => {
              const iconName = category.icon;
              const Icon =
                (iconName &&
                  (
                    Icons as unknown as Record<
                      string,
                      typeof Icons.BookOpen
                    >
                  )[iconName]) ||
                BookOpen;

              const isActive = activeCat?.id === category.id;
              const hasChildren = childrenOf(category.id).length > 0;

              return (
                <li key={category.id} role="none">
                  <Link
                    role="menuitem"
                    to={`/category/${category.slug}`}
                    aria-current={isActive ? "true" : undefined}
                    onMouseEnter={() => setActive(category.id)}
                    onFocus={() => setActive(category.id)}
                    onClick={closeMenu}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      isActive
                        ? "bg-card text-primary"
                        : "hover:bg-card",
                    )}
                  >
                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{category.name}</span>

                    {hasChildren && (
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Active category and subcategories */}
          <div className="min-w-0 p-5">
            {activeCat ? (
              <>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Browse
                </p>

                <Link
                  to={`/category/${activeCat.slug}`}
                  onClick={closeMenu}
                  className="font-display text-xl font-semibold tracking-tight hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {activeCat.name}
                </Link>

                <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {subs.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      to={`/category/${subcategory.slug}`}
                      onClick={closeMenu}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      {subcategory.name}
                    </Link>
                  ))}

                  {subs.length === 0 && (
                    <p className="col-span-full px-3 py-2 text-sm text-muted-foreground">
                      No subcategories yet.
                    </p>
                  )}
                </div>

                <Link
                  to={`/category/${activeCat.slug}`}
                  onClick={closeMenu}
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  View all {activeCat.name} →
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No categories available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}