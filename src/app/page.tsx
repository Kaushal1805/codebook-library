import { Hero } from "@/components/sections/hero";
import { FeaturedBooks } from "@/components/sections/featured-books";
import { Categories } from "@/components/sections/categories";
import { InterviewHubPreview } from "@/components/sections/interview-hub-preview";
import { ReviewsSection } from "@/components/sections/reviews";
import { CTA } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedBooks />
      <Categories />
      <InterviewHubPreview />
      <ReviewsSection />
      <CTA />
    </>
  );
}
