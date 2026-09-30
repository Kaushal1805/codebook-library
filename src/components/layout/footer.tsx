import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerSections = [
  {
    title: "Browse",
    links: [
      { label: "Books", href: "/books" },
      { label: "Categories", href: "/categories" },
      { label: "Interview Hub", href: "/interview-hub" },
      { label: "Free Resources", href: "/resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Founder", href: "/founder" },
      { label: "Admin Portal", href: "/admin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground"
            >
              <BookOpen className="h-5 w-5 text-amber-accent" />
              <span className="text-sm font-semibold tracking-tight">
                CodeBook Library
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Read. Learn. Prepare. Get Hired.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Practical books and resources for developers.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-amber-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} CodeBook Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
