import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[11px] sm:text-xs text-muted-foreground">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-3 w-3" />
      </Link>
      
      {items.map((item, index) => (
        <Fragment key={item.label}>
          <ChevronRight className="mx-1 h-3 w-3 shrink-0 opacity-50" />
          {item.href && index !== items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-foreground font-medium truncate"
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
