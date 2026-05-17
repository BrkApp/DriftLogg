import { Reveal } from "./Reveal";

interface Step {
  number: string;
  title: string;
  body: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const TerminalIcon: Step["Icon"] = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 9l3 3-3 3M13 15h4" />
  </svg>
);

const GaugeIcon: Step["Icon"] = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 14l4-4" />
    <path d="M3.5 18a9 9 0 1 1 17 0" />
  </svg>
);

const ShieldIcon: Step["Icon"] = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3l8 3v6c0 4.418-3.582 8-8 9-4.418-1-8-4.582-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const STEPS: Step[] = [
  { number: "1", title: "Paste your repo", body: "owner/repo or a github.com URL — that's it.", Icon: TerminalIcon },
  { number: "2", title: "Get a health score", body: "Six signals scored 0–100 in under a minute.", Icon: GaugeIcon },
  { number: "3", title: "Act before it breaks", body: "Plan the migration, alert your team, sleep tight.", Icon: ShieldIcon },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-dl-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            From repo URL to migration plan in 60 seconds
          </h2>
        </Reveal>
        <div className="mt-12 relative">
          <div
            aria-hidden
            className="hidden md:block absolute left-0 right-0 top-[28px] border-t border-dashed border-dl-border"
          />
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={120 + i * 100}>
                <li className="relative flex flex-col items-start">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dl-border bg-dl-bg text-dl-fg-muted">
                    <step.Icon className="h-6 w-6" />
                  </div>
                  <span className="mt-5 font-mono text-xs font-bold text-dl-green">
                    0{step.number}.
                  </span>
                  <h3 className="mt-1 text-base font-bold text-dl-fg">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-dl-fg-muted">
                    {step.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

