import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

interface Card {
  title: string;
  body: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const VelocityIcon: Card["Icon"] = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 16l4-4 4 3 6-7 4 4" />
    <path d="M3 20h18" />
  </svg>
);

const ResponseIcon: Card["Icon"] = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CommunityIcon: Card["Icon"] = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FreshnessIcon: Card["Icon"] = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const TrustIcon: Card["Icon"] = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3l8 3v6c0 4.418-3.582 8-8 9-4.418-1-8-4.582-8-9V6l8-3z" />
  </svg>
);

const SocialIcon: Card["Icon"] = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

const CARDS: Card[] = [
  { title: "Commit Velocity", body: "Are commits slowing down?", Icon: VelocityIcon },
  { title: "Maintainer Response", body: "How fast are issues answered?", Icon: ResponseIcon },
  { title: "Community Health", body: "How many active contributors?", Icon: CommunityIcon },
  { title: "Release Freshness", body: "When was the last release?", Icon: FreshnessIcon },
  { title: "Trust Signals", body: "Security policy? Funding? CI/CD?", Icon: TrustIcon },
  { title: "Social Signals", body: "Active community? Sponsors? Downloads?", Icon: SocialIcon },
];

export function ScoringGrid() {
  return (
    <section className="border-t border-dl-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            What we measure
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-3 text-base text-dl-fg-muted">
            Six signals, scored in seconds.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={100 + i * 60}>
              <div className="group h-full rounded-xl border border-dl-border bg-dl-surface p-6 transition-colors duration-200 hover:border-dl-green">
                <card.Icon className="h-6 w-6 text-dl-green" />
                <h3 className="mt-5 text-base font-bold text-dl-fg">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dl-fg-muted">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={500}>
          <div className="mt-10">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 font-mono text-sm text-dl-fg-muted transition-colors hover:text-dl-fg"
            >
              Read the full methodology
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

