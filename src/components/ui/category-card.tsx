import { Category } from "@/lib/data/categories";
import {
  Database,
  Code,
  BarChart3,
  FlaskConical,
  Brain,
  Sparkles,
  Link as LinkIcon,
  Search,
  GitBranch,
  Settings,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Database,
  Code,
  BarChart3,
  FlaskConical,
  Brain,
  Sparkles,
  Link: LinkIcon,
  Search,
  GitBranch,
  Settings,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Code;

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4 transition-colors duration-200 hover:border-border hover:bg-card/80">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-accent-muted">
        <Icon className="h-4 w-4 text-amber-accent" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-card-foreground">
          {category.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {category.description}
        </p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/60">
          {category.bookCount} books
        </p>
      </div>
    </div>
  );
}
