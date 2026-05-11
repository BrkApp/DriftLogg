import { Layout } from "@/components/shared/Layout";
import { Hero } from "@/components/landing/Hero";
import { DemoMockup } from "@/components/landing/DemoMockup";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ScoringGrid } from "@/components/landing/ScoringGrid";
import { Pricing } from "@/components/landing/Pricing";
import { WeeklyReports } from "@/components/landing/WeeklyReports";
import { EmailCapture } from "@/components/shared/EmailCapture";
import { Reveal } from "@/components/landing/Reveal";

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <DemoMockup />
      <ProblemSection />
      <HowItWorks />
      <ScoringGrid />
      <Pricing />
      <WeeklyReports />
      <section id="waitlist" className="border-t border-dl-border">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <EmailCapture variant="full" />
          </Reveal>
        </div>
      </section>
    </Layout>
  );
}
