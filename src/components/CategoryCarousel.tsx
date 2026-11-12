import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Store } from "@/data/seed";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export function CategoryCarousel({
  products,
  storeById,
  selection,
}: {
  products: Product[];
  storeById: Record<string, Store>;
  selection?: { active: boolean; ids: Set<string>; toggle: (id: string) => void };
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, products.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 240);
    el.scrollBy({ left: amount * dir, behavior: "smooth" });
  };

  // Drag-to-scroll (desktop)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      isDown = false;
      if (moved) {
        // suppress click after drag
        const suppress = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          el.removeEventListener("click", suppress, true);
        };
        el.addEventListener("click", suppress, true);
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="relative group">
      {canPrev && (
        <Button
          variant="outline" size="icon"
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          className="hidden md:inline-flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-[var(--shadow-card)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {canNext && (
        <Button
          variant="outline" size="icon"
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Próximo"
          className="hidden md:inline-flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-[var(--shadow-card)]"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="snap-start shrink-0 w-[46%] sm:w-[31%] md:w-[23%] lg:w-[19%] xl:w-[16%]"
          >
            <ProductCard product={p} store={storeById[p.storeId]} selection={selection ? { active: selection.active, selected: selection.ids.has(p.id), toggle: () => selection.toggle(p.id) } : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}
