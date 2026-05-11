import { Reveal } from "./reveal";

interface Item {
  title: string;
  body: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const VanishIcon: Item["Icon"] = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="4" strokeDasharray="2 2" />
    <path d="M5 21c0-3.866 3.134-7 7-7" strokeDasharray="2 2" />
    <path d="M14 18l4 4M18 18l-4 4" />
  </svg>
);

const ShieldOffIcon: Item["Icon"] = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3l8 3v6c0 4.418-3.582 8-8 9-4.418-1-8-4.582-8-9V6l8-3z" />
    <path d="M4 4l16 16" />
  </svg>
);

const BrokenIcon: Item["Icon"] = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12h6l1-3 4 6 1-3h6" />
    <path d="M12 5v2M12 17v2" />
  </svg>
);

const ITEMS: Item[] = [
  {
    title: "The maintainer vanishes",
    body: "Commits slow down. Issues go unanswered. One day the repo is archived.",
    Icon: VanishIcon,
  },
  {
    title: "Security patches stop",
    body: "Known vulnerabilities sit unfixed. Your scanner flags them months after the fact.",
    Icon: ShieldOffIcon,
  },
  {
    title: "Your build breaks",
    body: "A dependency update cascades. Production goes down. The postmortem writes itself.",
    Icon: BrokenIcon,
  },
];

export function ProblemSection() {
  return (
    <section className="border-t border-dl-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            You discover dead packages too late
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:gap-8 md:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={120 + i * 100}>
              <div className="h-full">
                <item.Icon className="h-8 w-8 text-dl-fg-muted" />
                <h3 className="mt-5 text-base font-bold text-dl-fg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dl-fg-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
