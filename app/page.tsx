import { Layout } from "@/components/shared/Layout";
import { Hero } from "@/components/landing/Hero";
import { getScanCount } from "@/lib/counter";
import { DemoMockup } from "@/components/landing/DemoMockup";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { TrackRecord } from "@/components/landing/TrackRecord";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ScoringGrid } from "@/components/landing/ScoringGrid";
import { Pricing } from "@/components/landing/Pricing";
import { WeeklyReports } from "@/components/landing/WeeklyReports";
import { NewsletterSection } from "@/components/landing/NewsletterSection";

export default async function HomePage() {
  const scanCount = await getScanCount();
  return (
    <Layout>
      <Hero scanCount={scanCount} />
      <DemoMockup />
      <ProblemSection />
      <ComparisonSection />
      <TrackRecord />
      <HowItWorks />
      <ScoringGrid />
      <Pricing />
      <WeeklyReports />
      <NewsletterSection />
    </Layout>
  );
}
