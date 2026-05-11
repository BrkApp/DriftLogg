import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "./reveal";

interface Plan {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: { label: string; href: string; variant: "ghost" | "solid" };
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    features: ["1 repo", "Instant health check", "Shareable report"],
    cta: { label: "Scan now", href: "/scan", variant: "ghost" },
  },
  {
    name: "Team",
    price: "$49",
    cadence: "/mo",
    features: [
      "Unlimited repos",
      "CI/CD integration",
      "Slack & email alerts",
      "Trend tracking",
    ],
    cta: { label: "Start trial", href: "#waitlist", variant: "solid" },
    highlight: true,
  },
  {
    name: "Org",
    price: "$499",
    cadence: "/mo",
    features: [
      "Org-wide scanning",
      "Custom thresholds",
      "API access",
      "Migration recommendations",
    ],
    cta: { label: "Contact us", href: "mailto:hi@driftlogg.dev", variant: "ghost" },
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-dl-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            Start free. Scale when you need to.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3 md:items-stretch">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={120 + i * 100}>
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const isHighlight = Boolean(plan.highlight);
  return (
    <div
      className={`relative flex h-full flex-col rounded-xl bg-dl-surface p-7 transition-colors duration-200 ${
        isHighlight
          ? "border-2 border-dl-green shadow-[0_0_60px_-15px_rgba(0,255,136,0.35)] md:-translate-y-1"
          : "border border-dl-border hover:border-dl-fg-muted/40"
      }`}
    >
      {isHighlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-dl-green px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-black">
          Most popular
        </span>
      )}
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-dl-fg-muted">
        {plan.name}
      </span>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-dl-fg">
          {plan.price}
        </span>
        {plan.cadence && (
          <span className="font-mono text-sm text-dl-fg-muted">{plan.cadence}</span>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-dl-fg">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                isHighlight ? "text-dl-green" : "text-dl-fg-muted"
              }`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.cta.href}
        className={`mt-7 inline-flex h-10 items-center justify-center rounded-md font-mono text-sm font-semibold transition-colors ${
          plan.cta.variant === "solid"
            ? "bg-dl-green text-black hover:bg-dl-green/90"
            : "border border-dl-green text-dl-green hover:bg-dl-green/10"
        }`}
      >
        {plan.cta.label}
      </Link>
    </div>
  );
}
