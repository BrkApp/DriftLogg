import type { ScanApiResponse } from "@/lib/types";
import { RepoHeader } from "./RepoHeader";
import { ScoreSection } from "./ScoreSection";
import { BreakdownSection } from "./BreakdownSection";
import { SignalsSection } from "./SignalsSection";
import { CtaSection } from "./CtaSection";

interface ScanResultsProps {
  report: ScanApiResponse;
}

export function ScanResults({ report }: ScanResultsProps) {
  return (
    <div className="mt-10 animate-fade-in space-y-6 sm:space-y-10">
      <RepoHeader
        fullName={report.data.fullName}
        description={report.data.description}
        url={report.data.url}
        scannedAt={report.scannedAt}
      />
      <ScoreSection
        score={report.score}
        risk={report.risk}
        prediction={report.prediction}
        fromCache={report.fromCache}
        cachedAt={report.cachedAt}
      />
      <BreakdownSection breakdown={report.breakdown} />
      <SignalsSection signals={report.signals} />
      <CtaSection />
    </div>
  );
}
