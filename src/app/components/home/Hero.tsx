// Hero slider, secondary promo cards and campaign banners from /banners.

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalog } from "../../contexts/CatalogContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import type { Banner } from "../../../types";

export function splitBanners(all: Banner[]) {
  const live = all.filter((b) => b.active !== false);
  const hasPlacement = live.some((b) => b.placement);
  if (!hasPlacement) {
    return { hero: live.slice(0, 1), secondary: live.slice(1, 3), campaign: live.slice(3) };
  }
  return {
    hero: live.filter((b) => !b.placement || b.placement === "hero"),
    secondary: live.filter((b) => b.placement === "secondary"),
    campaign: live.filter((b) => b.placement === "campaign"),
  };
}

export function useBanners() {
  const { banners, loading } = useCatalog();
  return { ...splitBanners(banners), loading: loading && banners.length === 0 };
}

function BannerArt({ b }: { b: Banner }) {
  return b.imageUrl ? (
    <ImageWithFallback src={b.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
  ) : null;
}

export function HeroSection() {
  const { hero, secondary, loading } = useBanners();

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]" aria-hidden>
        <div className="h-64 animate-pulse rounded-lg bg-muted md:h-[380px]" />
        <div className="hidden gap-4 lg:grid">
          <div className="animate-pulse rounded-lg bg-muted" />
          <div className="animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }
  if (hero.length === 0 && secondary.length === 0) return null;

  return (
    <div className={cn("grid gap-4", secondary.length > 0 && "lg:grid-cols-[2fr_1fr]")}>
      {hero.length > 0 && <HeroSlider banners={hero} />}
      {secondary.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {secondary.slice(0, 2).map((b) => (
            <Link
              key={b.id}
              to={b.ctaHref || "/books"}
              className="group relative flex min-h-[170px] flex-col justify-end overflow-hidden rounded-lg bg-accent p-6 text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              style={b.bg ? { background: b.bg } : undefined}
            >
              <BannerArt b={b} />
              {b.imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />}
              <div className="relative text-white">
                <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{b.title}</h3>
                {b.subtitle && <p className="mt-1 line-clamp-2 text-sm text-white/85">{b.subtitle}</p>}
                <span className="mt-3 inline-block text-sm font-medium underline-offset-4 group-hover:underline">{b.ctaLabel || "Shop now"} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroSlider({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, paused]);

  const b = banners[i % n];

  return (
    <div
      className="relative h-72 overflow-hidden rounded-lg bg-accent md:h-[380px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
        <div
          key={b.id}
          className="absolute inset-0 animate-in fade-in duration-500"
          style={b.bg ? { background: b.bg } : undefined}
          aria-roledescription="slide"
          aria-label={`${(i % n) + 1} of ${n}`}
        >
          <BannerArt b={b} />
          {b.imageUrl && <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" aria-hidden />}
          <div className="relative flex h-full max-w-xl flex-col justify-center px-8 text-white md:px-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">Featured</p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl">{b.title}</h2>
            {b.subtitle && <p className="mt-3 max-w-md text-white/85 md:text-lg">{b.subtitle}</p>}
            <div>
              <Button asChild className="mt-6 bg-background text-foreground hover:bg-background/90">
                <Link to={b.ctaHref || "/books"}>{b.ctaLabel || "Shop now"}</Link>
              </Button>
            </div>
          </div>
        </div>

      {n > 1 && (
        <>
          <div className="absolute bottom-4 left-8 flex gap-2 md:left-14">
            {banners.map((x, idx) => (
              <button
                key={x.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === i % n}
                onClick={() => setI(idx)}
                className={cn("h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", idx === i % n ? "w-7 bg-white" : "w-3 bg-white/50")}
              />
            ))}
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button type="button" aria-label="Previous slide" onClick={() => setI((v) => (v - 1 + n) % n)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Next slide" onClick={() => setI((v) => (v + 1) % n)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Wide dark campaign banner (accent ground unless the banner sets its own). */
export function CampaignBanner({ banner, className }: { banner: Banner; className?: string }) {
  return (
    <Link
      to={banner.ctaHref || "/books"}
      className={cn("group relative flex min-h-[180px] items-center overflow-hidden rounded-lg bg-accent px-8 py-10 text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:px-12", className)}
      style={banner.bg ? { background: banner.bg } : undefined}
    >
      <BannerArt b={banner} />
      {banner.imageUrl && <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" aria-hidden />}
      <div className="relative max-w-xl text-white">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">Campaign</p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">{banner.title}</h3>
        {banner.subtitle && <p className="mt-2 text-white/85">{banner.subtitle}</p>}
        <span className="mt-4 inline-block text-sm font-medium underline-offset-4 group-hover:underline">{banner.ctaLabel || "Explore"} →</span>
      </div>
    </Link>
  );
}
