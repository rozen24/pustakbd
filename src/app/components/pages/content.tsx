// Content pages: blog index, blog post, CMS page, and 404.

import { Link, useParams } from "@/lib/navigation";
import { BookOpen, FileQuestion, Newspaper } from "lucide-react";
import { useQuery } from "../../../lib/query";
import { services } from "../../../services";
import { BookCover } from "../common/BookCover";
import { EmptyState } from "../common/EmptyState";
import { CONTAINER, Breadcrumbs, ErrorState, Eyebrow, PageHeader } from "../catalog/states";
import { formatDate } from "../../../lib/format";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

function ArticleSkeleton() {
  return (
    <div className={cn(CONTAINER, "max-w-3xl space-y-4 py-12")} aria-busy>
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
      <div className="aspect-[16/8] animate-pulse rounded-lg bg-muted" />
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-muted" />)}
    </div>
  );
}

export function BlogPage() {
  const posts = useQuery(["blog"], () => services.content.blogPosts());
  const list = [...(posts.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const [lead, ...rest] = list;

  return (
    <div className={cn(CONTAINER, "py-8")}>
      <PageHeader crumbs={[{ label: "Home", to: "/" }, { label: "Blog" }]} eyebrow="The journal" title="The Boierpata Blog" description="Reading lists, tips, and stories from our team." />
      {posts.loading ? (
        <div className="grid gap-6 md:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="space-y-3"><div className="aspect-[16/10] animate-pulse rounded-lg bg-muted" /><div className="h-5 w-3/4 animate-pulse rounded bg-muted" /><div className="h-3 w-1/2 animate-pulse rounded bg-muted" /></div>)}
        </div>
      ) : posts.error ? (
        <ErrorState error={posts.error} onRetry={posts.refetch} title="Couldn't load the blog" />
      ) : !lead ? (
        <EmptyState icon={Newspaper} title="No posts yet" description="Check back soon for reading lists and stories." />
      ) : (
        <>
          <Link to={`/blog/${lead.slug}`} className="group mb-12 grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-2">
            <div className="aspect-[16/10] overflow-hidden md:aspect-auto"><BookCover title={lead.title} coverUrl={lead.coverUrl} /></div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <Eyebrow>{lead.category}</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight group-hover:text-primary">{lead.title}</h2>
              <p className="mt-3 line-clamp-3 text-muted-foreground">{lead.excerpt}</p>
              <p className="mt-5 text-xs text-muted-foreground">{lead.author} · {formatDate(lead.createdAt)}</p>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group">
                  <div className="aspect-[16/10] overflow-hidden rounded-lg"><BookCover title={p.title} coverUrl={p.coverUrl} /></div>
                  <Eyebrow className="mt-4">{p.category}</Eyebrow>
                  <h3 className="mt-1 line-clamp-2 font-display text-xl font-semibold leading-snug tracking-tight group-hover:text-primary">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{p.author} · {formatDate(p.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const postQ = useQuery(["blog", slug], () => services.content.blogBySlug(slug!), { enabled: !!slug });
  if (postQ.loading) return <ArticleSkeleton />;
  if (postQ.error) return <div className={cn(CONTAINER, "max-w-3xl py-16")}><ErrorState error={postQ.error} onRetry={postQ.refetch} /></div>;
  if (!postQ.data) return <div className={cn(CONTAINER, "max-w-3xl py-16")}><EmptyState icon={Newspaper} title="Post not found" action={<Button asChild><Link to="/blog">Back to blog</Link></Button>} /></div>;
  const p = postQ.data;
  return (
    <article className={cn(CONTAINER, "max-w-3xl py-10")}>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Blog", to: "/blog" }, { label: p.title }]} className="mb-6" />
      <Eyebrow>{p.category}</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{p.title}</h1>
      {p.excerpt && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{p.excerpt}</p>}
      <p className="mt-4 border-b border-border pb-6 text-sm text-muted-foreground">By <span className="text-foreground">{p.author}</span> · {formatDate(p.createdAt)}</p>
      {p.coverUrl && <div className="my-8 aspect-[16/8] overflow-hidden rounded-lg"><BookCover title={p.title} coverUrl={p.coverUrl} /></div>}
      <div className="space-y-5 text-[17px] leading-[1.8] text-foreground/90">
        {p.body.split("\n\n").map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
      </div>
      <div className="mt-12 border-t border-border pt-6">
        <Button asChild variant="outline"><Link to="/blog">← More from the blog</Link></Button>
      </div>
    </article>
  );
}

export function CmsPage() {
  const { slug } = useParams();
  const pageQ = useQuery(["cms", slug], () => services.content.cmsPage(slug!), { enabled: !!slug });
  if (pageQ.loading) return <ArticleSkeleton />;
  if (pageQ.error) return <div className={cn(CONTAINER, "max-w-3xl py-16")}><ErrorState error={pageQ.error} onRetry={pageQ.refetch} /></div>;
  if (!pageQ.data) return <div className={cn(CONTAINER, "max-w-3xl py-16")}><EmptyState title="Page not found" action={<Button asChild><Link to="/">Go home</Link></Button>} /></div>;
  const page = pageQ.data;
  return (
    <div className={cn(CONTAINER, "max-w-3xl py-10")}>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: page.title }]} className="mb-6" />
      <h1 className="border-b border-border pb-6 font-display text-4xl font-semibold tracking-tight">{page.title}</h1>
      <div className="mt-8 space-y-5 text-[16px] leading-[1.8] text-foreground/90">
        {page.body.split("\n\n").map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className={cn(CONTAINER, "flex max-w-2xl flex-col items-center py-24 text-center")}>
      <FileQuestion size={32} className="text-muted-foreground" />
      <p className="mt-6 font-display text-7xl font-semibold tracking-tight tabular-nums">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">This page is missing from the shelf</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild><Link to="/">Back to home</Link></Button>
        <Button asChild variant="outline" className="gap-2"><Link to="/books"><BookOpen size={15} /> Browse books</Link></Button>
      </div>
    </div>
  );
}
