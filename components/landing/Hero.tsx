import { Reveal } from "./Reveal";
import { ScanInput } from "@/components/shared/ScanInput";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.06),transparent_70%)]"
      />
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-20 sm:px-6 md:pt-32">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
            {"// open source health monitoring"}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-dl-fg md:text-[52px]">
            Watch your dependencies
            <br className="hidden sm:block" /> before they die.
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
            Snyk Advisor is gone. DriftLogg picks up where it left off —
            continuous health monitoring, decay prediction, and alternative
            recommendations for every package your stack depends on.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="mt-10 max-w-2xl">
            <ScanInput size="lg" />
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-4 font-mono text-[13px] text-dl-fg-muted">
            No signup required · Free for 1 repo · Takes 30 seconds
          </p>
        </Reveal>
      </div>
    </section>
  );
}

