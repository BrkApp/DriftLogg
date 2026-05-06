import {
  BarChart3,
  Check,
  Clock,
  Github,
  Mail,
  MessageSquareWarning,
  Rocket,
  Search,
  Sparkles,
  Twitter,
  UserX,
  Zap,
} from "lucide-react";
import { HeroSearch } from "@/components/landing/hero-search";
import { Reveal } from "@/components/landing/reveal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-[#00FF88]/30 selection:text-black">
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.08),transparent_60%)]"
      />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-24 md:pt-36">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#00FF88]">
            // open source drift detection
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Vos dépendances open source{" "}
            <span className="text-[#FF4444]">vont mourir</span>.
            <span className="mt-2 block text-zinc-400 md:mt-3">
              Vous le saurez en premier.
            </span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl">
            DriftLogg prédit le déclin des packages avant que votre build ne
            casse.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 max-w-2xl">
            <HeroSearch />
          </div>
        </Reveal>
        <Reveal delay={320}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-zinc-500">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
              scoring déterministe
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
              0 signup
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
              GitHub public
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    icon: UserX,
    title: "Le mainteneur disparaît",
    body: "Les contributeurs s'évaporent silencieusement. Le repo a l'air vivant — il ne l'est plus.",
  },
  {
    icon: MessageSquareWarning,
    title: "Les issues s'empilent",
    body: "Le triage tombe à zéro. Les bugs critiques traînent pendant des mois sans réponse.",
  },
  {
    icon: Clock,
    title: "Vous l'apprenez trop tard",
    body: "Le jour où vous le découvrez, c'est en plein incident. Refacto en urgence et nuit blanche.",
  },
];

function Problem() {
  return (
    <section id="problem" className="border-t border-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            // le problème
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            L&apos;open source ne meurt pas d&apos;un coup. Il dérive.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={120 + i * 100}>
              <div className="h-full rounded-xl border border-zinc-900 bg-zinc-950 p-6 transition-colors hover:border-zinc-800">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#FF4444]/10 text-[#FF4444]">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Search,
    title: "Scannez votre repo",
    body: "Collez n'importe quelle URL GitHub publique. Pas de signup, pas de config.",
  },
  {
    icon: BarChart3,
    title: "Voyez les risques scorés",
    body: "Score 0–100 avec breakdown : vélocité, réactivité, communauté, fraîcheur, confiance.",
  },
  {
    icon: Zap,
    title: "Agissez avant la casse",
    body: "Identifiez un fork actif, planifiez la migration, alertez l'équipe — avant le prochain incident.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="border-t border-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#00FF88]">
            // comment ça marche
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Trois étapes. Aucune intégration.
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={120 + i * 100}>
              <li className="relative h-full rounded-xl border border-zinc-900 bg-zinc-950 p-6">
                <span className="absolute -top-3 left-6 rounded-full border border-zinc-800 bg-black px-2 py-0.5 font-mono text-[10px] text-[#00FF88]">
                  0{i + 1}
                </span>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#00FF88]/10 text-[#00FF88]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    icon: Sparkles,
    highlight: false,
    features: [
      "1 repo à la fois",
      "Health check de base",
      "Score + breakdown",
      "Données publiques GitHub",
    ],
    cta: "Scanner",
    href: "#hero",
  },
  {
    name: "Team",
    price: "$49",
    cadence: "/mois",
    icon: Rocket,
    highlight: true,
    features: [
      "Monitoring continu",
      "Intégration CI",
      "Alertes Slack & email",
      "Jusqu'à 50 repos",
    ],
    cta: "Bientôt",
    href: "#hero",
  },
  {
    name: "Org",
    price: "$499",
    cadence: "/mois",
    icon: BarChart3,
    highlight: false,
    features: [
      "Scan illimité",
      "Seuils custom par repo",
      "Accès API",
      "Support prioritaire",
    ],
    cta: "Bientôt",
    href: "#hero",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            // pricing
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Gratuit pour scanner. Payant pour surveiller.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={120 + i * 100}>
              <div
                className={`relative flex h-full flex-col rounded-xl border bg-zinc-950 p-6 ${
                  plan.highlight
                    ? "border-[#00FF88] shadow-[0_0_60px_-10px_rgba(0,255,136,0.4)]"
                    : "border-zinc-900"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-[#00FF88] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-black">
                    populaire
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <plan.icon
                    className={`h-4 w-4 ${
                      plan.highlight ? "text-[#00FF88]" : "text-zinc-500"
                    }`}
                  />
                  <span className="font-mono text-sm uppercase tracking-wider text-zinc-400">
                    {plan.name}
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="font-mono text-sm text-zinc-500">
                    {plan.cadence}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-zinc-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlight ? "text-[#00FF88]" : "text-zinc-500"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.href}
                  className={`mt-8 inline-flex h-10 items-center justify-center rounded-md font-mono text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-[#00FF88] text-black hover:bg-[#00FF88]/90"
                      : "border border-zinc-800 text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-sm text-zinc-400">
          Built for engineering teams who&apos;ve been burned before.
        </p>
        <nav className="flex items-center gap-5 text-zinc-400">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-[#00FF88]"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
            className="transition-colors hover:text-[#00FF88]"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="mailto:hi@driftlogg.dev"
            aria-label="Email"
            className="transition-colors hover:text-[#00FF88]"
          >
            <Mail className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
