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
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-dl-fg md:text-[48px]">
            Your dependencies will die. You&apos;ll know first.
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
            DriftLogg monitors open source package health and predicts decay
            60â€“90 days before your build breaks.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 max-w-2xl">
            <ScanInput size="lg" />
          </div>
        </Reveal>
        <Reveal delay={280}>
          <p className="mt-4 font-mono text-[13px] text-dl-fg-muted">
            No signup required Â· Free for 1 repo Â· Takes 30 seconds
          </p>
        </Reveal>
      </div>
    </section>
  );
}

