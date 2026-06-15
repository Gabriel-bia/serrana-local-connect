import type { ProviderWork } from "@/data/seed";

export function WorkCard({ work }: { work: ProviderWork }) {
  const date = work.date
    ? new Date(work.date + "T00:00:00").toLocaleDateString("pt-BR")
    : "";
  return (
    <div className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={work.image}
          alt={work.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{work.title}</h3>
        {work.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{work.description}</p>
        )}
        {date && <p className="mt-2 text-[11px] font-medium text-primary">{date}</p>}
      </div>
    </div>
  );
}
