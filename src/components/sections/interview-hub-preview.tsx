import { companies } from "@/lib/data/companies";
import { CompanyCard } from "@/components/ui/company-card";
import { Badge } from "@/components/ui/badge";

export function InterviewHubPreview() {
  return (
    <section className="border-b border-border/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Interview Hub
          </h2>
          <Badge
            variant="outline"
            className="text-[10px] font-normal text-muted-foreground"
          >
            Preview
          </Badge>
        </div>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Community-reported interview experiences and practice questions.
          Organized by company to help you prepare for specific roles.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/50">
          These are not official company questions. All content is based on
          publicly shared experiences.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
