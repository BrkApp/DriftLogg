import { Activity, AlertTriangle, GitCommit, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: GitCommit,
    title: "Commit cadence",
    body: "Detects stalls, sudden drops in throughput, and bus-factor risk based on contributor distribution over the last 90 days.",
  },
  {
    icon: AlertTriangle,
    title: "Issue triage signals",
    body: "Tracks open vs. closed ratios, stale-issue accumulation, and average response time to surface neglected projects.",
  },
  {
    icon: Activity,
    title: "Release health",
    body: "Measures time since last release, version cadence, and tag freshness — even when the readme says 'actively maintained'.",
  },
  {
    icon: Users,
    title: "Community vitality",
    body: "Combines contributors, stars, and license signals into an adoption-risk score that goes deeper than vanity metrics.",
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Four signals. One drift score.
        </h2>
        <p className="mt-4 text-muted-foreground">
          We aggregate the signals maintainers wish their users were watching, so you can
          act before a critical dep goes dark.
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{f.title}</CardTitle>
              <CardDescription>{f.body}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </section>
  );
}
