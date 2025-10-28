import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Layers, Workflow, ShieldCheck, BarChart3 } from "lucide-react";

const highlights = [
  {
    title: "Answer questions in seconds",
    description:
      "Surface configuration, lineage, and execution context for every resource without hopping between consoles.",
    icon: Sparkles,
  },
  {
    title: "Operational guardrails",
    description:
      "Track dependencies and owners so runbooks, alerts, and audits stay in lockstep with the platform team.",
    icon: ShieldCheck,
  },
  {
    title: "Works across your stack",
    description:
      "Integrate assets with Kestra flows, third-party apps, and catalogs to create a single source of truth.",
    icon: Workflow,
  },
];

const enterpriseAddOns = [
  "Interactive asset catalog with lineage and impact analysis",
  "Role-based access controls and approval workflows",
  "Historical insights for performance, cost, and governance",
  "24/7 enterprise support with onboarding assistance",
];

export default function AssetsOssPage() {
  return (
    <div className="min-h-screen bg-[#1F232D] text-foreground py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <header className="flex flex-col gap-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Return to dashboard
          </Link>
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#2F3341] via-[#1F232D] to-[#3B2F5C] shadow-[0_20px_60px_-20px_rgba(132,8,255,0.45)]">
            <div className="grid gap-10 p-10 md:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-5">
                <Badge variant="secondary" className="w-fit border border-primary/40 bg-primary/15 text-xs uppercase tracking-wide text-primary">
                  Kestra Enterprise
                </Badge>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Assets is a premium feature designed for production teams
                </h1>
                <p className="text-base text-muted-foreground">
                  Kestra Assets gives observability teams a unified source of truth for every dataset, service, and
                  integration. Manage ownership, downstream impact, and operational readiness without leaving the
                  Kestra UI.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <a href="https://kestra.io/request-demo" target="_blank" rel="noreferrer">
                      Book a demo
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="border-border/60 bg-transparent text-sm text-foreground hover:bg-white/10"
                  >
                    <a href="https://kestra.io/enterprise" target="_blank" rel="noreferrer">
                      Explore Kestra Enterprise
                    </a>
                  </Button>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/10 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm text-emerald-300">
                    <Layers className="h-4 w-4" />
                    <span>Kestra Enterprise customers unlock:</span>
                  </div>
                  <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <li>Instant asset search across namespaces</li>
                    <li>Dependency graphs with blast-radius analysis</li>
                    <li>Change monitoring with audit-ready timelines</li>
                    <li>Granular permissions and approvals</li>
                  </ul>
                </div>
              </div>
              <div className="relative isolate flex items-center justify-center">
                <div className="absolute -inset-10 -z-10 rounded-full bg-primary/20 blur-3xl" />
                <Card className="w-full overflow-hidden border border-white/10 bg-[#262A35]/80 p-6 shadow-xl">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Asset snapshots</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg border border-white/5 bg-[#1F232D] p-4">
                      <div className="text-sm font-medium text-foreground">Understand context instantly</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Drill into runtime metadata, owning teams, and operational runbooks without leaving Kestra.
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-[#1F232D] p-4">
                      <div className="text-sm font-medium text-foreground">Spot blast radius</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Visualize upstream and downstream relationships to plan deployments confidently.
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-[#1F232D] p-4">
                      <div className="text-sm font-medium text-foreground">Automate response</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Trigger flows, alerts, and reviews whenever an asset shifts state or ownership.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="flex h-full flex-col gap-4 border border-white/5 bg-[#262A35] p-6">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-white/5 bg-[#262A35] p-8">
            <h2 className="text-2xl font-semibold">Why upgrade?</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Teams running Kestra in mission-critical environments rely on Assets to deliver audit-ready visibility and
              faster incident response. Enterprise features extend the core Kestra experience with the controls and
              insights platform teams need to scale.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-muted-foreground">
              {enterpriseAddOns.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="flex flex-col justify-between gap-6 border border-primary/20 bg-primary/10 p-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Ready to see it live?</h3>
              <p className="text-sm text-primary/80">
                Book a guided tour with the Kestra team and explore how Assets helps your operators, data engineers, and
                platform leads move faster with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-[#1F232D] hover:bg-white/90">
                <a href="https://kestra.io/request-demo" target="_blank" rel="noreferrer">
                  Talk to us
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <a href="https://kestra.io/contact" target="_blank" rel="noreferrer">
                  Contact sales
                </a>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
