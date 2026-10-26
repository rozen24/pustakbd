// Product image gallery: large cover with a thumbnail strip built from
// coverUrl + images[] (deduplicated).

import { useEffect, useMemo, useState } from "react";
import { BookCover } from "../common/BookCover";
import { cn } from "../ui/utils";

export function ProductGallery({ title, author, coverUrl, images = [], badge }: {
  title: string;
  author?: string;
  coverUrl?: string;
  images?: string[];
  badge?: React.ReactNode;
}) {
  const all = useMemo(() => [coverUrl, ...images].filter((u, i, arr): u is string => !!u && arr.indexOf(u) === i), [coverUrl, images]);
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [coverUrl]);
  const current = all[active] ?? coverUrl;

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row lg:flex-col-reverse xl:flex-row">
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible lg:flex-row xl:flex-col" role="tablist" aria-label="Book images">
          {all.map((src, i) => (
            <button
              key={src}
              role="tab"
              aria-selected={i === active}
              aria-label={`Image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn("h-20 w-14 shrink-0 overflow-hidden rounded-[3px] border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}
            >
              <BookCover title={title} coverUrl={src} />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex flex-1 items-center justify-center rounded-lg bg-secondary/60 p-6 sm:p-10">
        {badge && <div className="absolute left-3 top-3 z-10">{badge}</div>}
        <div className="aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-[3px] shadow-sm ring-1 ring-border">
          <BookCover title={title} author={author} coverUrl={current} />
        </div>
      </div>
    </div>
  );
}
