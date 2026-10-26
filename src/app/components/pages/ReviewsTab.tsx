// Reviews for a book: rating summary + histogram, list of approved reviews,
// and a submit form for signed-in users. New reviews await admin approval.

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { MessageSquare, Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { useAuth } from "../../contexts/AuthContext";
import { RatingStars } from "../common/RatingStars";
import { formatDate } from "../../../lib/format";
import type { Book } from "../../../types";
import { ErrorState } from "../catalog/states";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "../ui/utils";

export function ReviewsTab({ book }: { book: Book }) {
  const { user } = useAuth();
  const reviews = useQuery(["reviews", book.id], () => services.reviews.forBook(book.id));
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await services.reviews.add({ bookId: book.id, rating, title, body });
      toast.success("Thanks! Your review will appear once approved.");
      setTitle(""); setBody(""); setRating(5);
    } catch (err) {
      toast.error(`Could not submit review: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const list = reviews.data ?? [];
  const counts = [5, 4, 3, 2, 1].map((n) => list.filter((r) => Math.round(r.rating) === n).length);
  const totalForBars = Math.max(1, list.length);
  const avg = book.ratingAvg || (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <div className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-semibold leading-none tabular-nums">{avg ? avg.toFixed(1) : "—"}</span>
            <div className="pb-1">
              <RatingStars value={avg} size={15} />
              <p className="mt-1 text-xs text-muted-foreground">{book.ratingCount} {book.ratingCount === 1 ? "rating" : "ratings"}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2" aria-label="Rating distribution">
            {[5, 4, 3, 2, 1].map((n, i) => (
              <li key={n} className="flex items-center gap-3 text-xs">
                <span className="flex w-6 items-center gap-0.5 tabular-nums">{n}<Star size={10} className="text-primary" fill="currentColor" /></span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(counts[i] / totalForBars) * 100}%` }} />
                </div>
                <span className="w-6 text-right tabular-nums text-muted-foreground">{counts[i]}</span>
              </li>
            ))}
          </ul>
          {list.length > 0 && <p className="mt-3 text-[11px] text-muted-foreground">Based on {list.length} published {list.length === 1 ? "review" : "reviews"}</p>}
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold">Write a review</h3>
          {!user ? (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Please sign in to share your thoughts.</p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link to={`/login?redirect=${encodeURIComponent(`/book/${book.slug}`)}`}>Sign in</Link></Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-3 space-y-3">
              <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= (hover || rating);
                  return (
                    <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                      <Star size={24} className={on ? "text-primary" : "text-muted-foreground/40"} fill={on ? "currentColor" : "none"} />
                    </button>
                  );
                })}
              </div>
              <Input placeholder="Review title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Review title" />
              <Textarea placeholder="Share your thoughts…" value={body} onChange={(e) => setBody(e.target.value)} rows={4} required aria-label="Review" />
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</Button>
              <p className="text-[11px] text-muted-foreground">Reviews are published after moderation.</p>
            </form>
          )}
        </div>
      </div>

      <div>
        {reviews.loading ? (
          <div className="space-y-4" aria-busy>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : reviews.error ? (
          <ErrorState error={reviews.error} onRetry={reviews.refetch} title="Couldn't load reviews" />
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-14 text-center">
            <MessageSquare size={26} className="text-muted-foreground" />
            <p className="mt-3 font-display text-lg font-semibold">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to review this book.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold">{r.userName?.charAt(0)?.toUpperCase() || "?"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.userName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                  </div>
                  <RatingStars value={r.rating} />
                </div>
                {r.title && <p className={cn("mt-3 font-display font-semibold")}>{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{r.body}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><ThumbsUp size={12} /> {r.helpful} found this helpful</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
