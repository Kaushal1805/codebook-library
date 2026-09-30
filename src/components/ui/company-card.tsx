import { Company } from "@/lib/data/companies";
import { CompanyLogo } from "@/components/ui/company-logo";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      href={`/books?company=${encodeURIComponent(company.name)}`}
      aria-label={`View books relevant to ${company.name} interviews`}
      className="group flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-card/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo name={company.name} />
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">
            {company.name}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {company.questionCount} practice questions · View related books
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-amber-400" />
    </Link>
  );
}
