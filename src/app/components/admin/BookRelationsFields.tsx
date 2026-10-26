"use client";

// Publisher, author and category pickers for the add / edit book form.
// Save as src/app/components/admin/BookRelationsFields.tsx
//
// Usage inside the form (the form state is a Partial<Book>):
//
//   <BookRelationsFields
//     value={{
//       publisherId: form.publisherId ?? "",
//       authorIds: form.authorIds ?? [],
//       categoryIds: form.categoryIds ?? [],
//     }}
//     onChange={(r) => setForm((f) => ({ ...f, ...r }))}
//   />

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import type { Author, Category, Publisher } from "../../../types";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

export interface BookRelations {
  publisherId: string;
  authorIds: string[];
  categoryIds: string[];
}

interface Props {
  value: BookRelations;
  onChange: (next: BookRelations) => void;
}

export function BookRelationsFields({ value, onChange }: Props) {
  const authors = useQuery<Author[]>(["catalog", "authors"], () => services.catalog.authors());
  const publishers = useQuery<Publisher[]>(["catalog", "publishers"], () => services.catalog.publishers());
  const categories = useQuery<Category[]>(["catalog", "categories"], () => services.catalog.categories());

  // "Parent › Child" so subcategories are easy to tell apart.
  const categoryLabel = useMemo(() => {
    const byId = new Map((categories.data ?? []).map((c) => [c.id, c]));
    return (c: Category) => {
      const parent = c.parentId ? byId.get(c.parentId) : undefined;
      return parent ? `${parent.name} › ${c.name}` : c.name;
    };
  }, [categories.data]);

  return (
    <div className="grid gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="book-publisher">Publisher</Label>
        <select
          id="book-publisher"
          value={value.publisherId}
          onChange={(e) => onChange({ ...value, publisherId: e.target.value })}
          className="h-9 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <option value="">{publishers.loading ? "Loading…" : "No publisher"}</option>
          {(publishers.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <MultiPicker
        label="Authors"
        placeholder="Search authors…"
        emptyText="No authors yet. An admin can add them under Admin → Authors."
        loading={authors.loading}
        items={(authors.data ?? []).map((a) => ({ id: a.id, label: a.name }))}
        selected={value.authorIds}
        onChange={(authorIds) => onChange({ ...value, authorIds })}
      />

      <MultiPicker
        label="Categories"
        placeholder="Search categories…"
        emptyText="No categories yet. An admin can add them under Admin → Categories."
        loading={categories.loading}
        items={(categories.data ?? []).map((c) => ({ id: c.id, label: categoryLabel(c) }))}
        selected={value.categoryIds}
        onChange={(categoryIds) => onChange({ ...value, categoryIds })}
      />
    </div>
  );
}

function MultiPicker({
  label, placeholder, emptyText, loading, items, selected, onChange,
}: {
  label: string;
  placeholder: string;
  emptyText: string;
  loading: boolean;
  items: { id: string; label: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [term, setTerm] = useState("");
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const available = useMemo(() => {
    const t = term.trim().toLowerCase();
    return items
      .filter((i) => !selected.includes(i.id) && (!t || i.label.toLowerCase().includes(t)))
      .slice(0, 50);
  }, [items, selected, term]);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <li key={id} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
              {byId.get(id)?.label ?? "Unknown"}
              <button
                type="button"
                aria-label={`Remove ${byId.get(id)?.label ?? "item"}`}
                onClick={() => onChange(selected.filter((x) => x !== id))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Input placeholder={placeholder} value={term} onChange={(e) => setTerm(e.target.value)} aria-label={`Search ${label.toLowerCase()}`} />

      <ul className="max-h-44 overflow-y-auto rounded-md border border-border bg-card" role="listbox" aria-label={label}>
        {loading ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">Loading…</li>
        ) : items.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
        ) : available.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">
            {term ? "No matches" : "Everything is already selected"}
          </li>
        ) : (
          available.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => { onChange([...selected, i.id]); setTerm(""); }}
                className={cn("w-full px-3 py-2 text-left text-sm hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none")}
              >
                {i.label}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}