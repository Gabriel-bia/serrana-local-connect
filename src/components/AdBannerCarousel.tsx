import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/data/seed";
import { isExternalLink } from "@/lib/banners";

export function AdBannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = banners.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <section className="container mx-auto px-4 pt-2 pb-4" aria-label="Anúncios">
      <div
        className="relative overflow-hidden rounded-xl bg-muted aspect-[16/7] sm:aspect-[3/1] lg:aspect-[4/1]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start == null || end == null || Math.abs(end - start) < 40) return;
          go(index + (end < start ? 1 : -1));
        }}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((b, i) => {
            const img = (
              <img
                src={b.image}
                alt={b.title || "Anúncio"}
                className="h-full w-full object-contain"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
            );
            return (
              <div key={b.id} className="h-full w-full shrink-0" aria-hidden={i !== index}>
                {b.link ? (
                  <a
                    href={b.link}
                    tabIndex={i === index ? 0 : -1}
                    {...(isExternalLink(b.link) ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}
                    className="block h-full w-full"
                  >
                    {img}
                  </a>
                ) : img}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button type="button" aria-label="Anúncio anterior" onClick={() => go(index - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Próximo anúncio" onClick={() => go(index + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/50 px-2 py-1 backdrop-blur">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Ir para anúncio ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-primary" : "w-1.5 bg-foreground/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
