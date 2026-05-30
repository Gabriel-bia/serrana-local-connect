import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { Category } from "@/data/seed";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
      {categories.map((c) => {
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon] ?? Icons.Tag;
        return (
          <Link
            key={c.id}
            to="/categoria/$slug"
            params={{ slug: c.slug }}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </span>
            <span className="text-xs font-medium">{c.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
