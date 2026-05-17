import { Reveal } from "./Reveal";
import { EmailCapture } from "@/components/shared/EmailCapture";

export function NewsletterSection() {
  return (
    <section id="newsletter" className="border-t border-dl-border">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
            {"// dead package weekly"}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            The npm obituary column,
            <br className="hidden sm:block" /> delivered every Monday.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-dl-fg-muted">
            Every week we scan the 50 most depended-on npm packages and send you
            the ones heading toward abandonment — before your build breaks.
            One email. No noise. Unsubscribe anytime.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-8 max-w-md">
            <EmailCapture
              variant="inline"
              buttonLabel="Subscribe free"
            />
            <p className="mt-3 font-mono text-xs text-dl-fg-muted">
              Joining the weekly scan waitlist. No spam.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
