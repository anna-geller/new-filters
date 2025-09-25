import type { ElementType } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, Clock3, Link, Zap } from "lucide-react";

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  caption?: string;
}

interface UsageItem {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  trend?: string;
}

interface ActivityLog {
  id: string;
  label: string;
  timestamp: string;
  status: "success" | "warning" | "info";
  description: string;
}

interface ResourceStat {
  id: string;
  icon: ElementType;
  label: string;
  value: string;
  sublabel?: string;
}

interface SystemOverviewTemplateProps {
  scope: "instance" | "tenant";
  title: string;
  subtitle: string;
  summary: MetricCard[];
  usage: UsageItem[];
  activity: ActivityLog[];
  resources: ResourceStat[];
}

export function SystemOverviewTemplate({ scope, title, subtitle, summary, usage, activity, resources }: SystemOverviewTemplateProps) {
  const trendIcon = (trend?: "up" | "down") => {
    if (!trend) return null;
    return trend === "up" ? <ArrowUpRight className="h-4 w-4 text-emerald-400" /> : <ArrowDownRight className="h-4 w-4 text-rose-400" />;
  };

  const statusIcon = (status: ActivityLog["status"]) => {
    if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    return <Clock3 className="h-4 w-4 text-sky-400" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{scope === "instance" ? "Instance Administration" : "Tenant Administration"}</span>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
            <Button size="sm" variant="secondary" className="gap-2">
              <Zap className="h-4 w-4" /> Run diagnostics
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <section className="grid gap-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((metric) => (
              <Card key={metric.id} className="border border-border/60 bg-card/70 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.title}</p>
                  {metric.trend && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${metric.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
                      {trendIcon(metric.trend)}
                      {metric.change}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
                {metric.caption && <p className="mt-1 text-xs text-muted-foreground">{metric.caption}</p>}
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border border-border/60 bg-card/70 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Platform throughput</p>
                  <h2 className="text-lg font-semibold text-foreground">Last 24 hours</h2>
                </div>
                <Button size="sm" variant="ghost" className="text-xs">
                  View details
                </Button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {["Executions", "Tasks", "Triggers", "Notifications"].map((label, index) => {
                  const percentages = [72, 54, 63, 41];
                  const colors = ["from-sky-500", "from-emerald-500", "from-amber-500", "from-rose-500"];
                  return (
                    <div key={label} className="rounded-xl border border-border/50 bg-muted/10 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{label}</span>
                        <span className="text-muted-foreground">{percentages[index]}%</span>
                      </div>
                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-border/40">
                        <div className={`h-full rounded-full bg-gradient-to-r ${colors[index]} to-transparent`} style={{ width: `${percentages[index]}%` }} />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">Compared to the previous 7 days.</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your usage</p>
              <h2 className="text-lg font-semibold text-foreground">Current allocation</h2>
              <div className="mt-4 space-y-4">
                {usage.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/40 bg-muted/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-base font-semibold text-foreground">{item.value}</span>
                    </div>
                    {item.sublabel && <p className="mt-1 text-xs text-muted-foreground">{item.sublabel}</p>}
                    {item.trend && <p className="mt-1 text-xs text-muted-foreground/80">{item.trend}</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest activity</p>
                <Button variant="ghost" size="sm" className="text-xs">
                  View execution log
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/10 p-4">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-card/60">
                      {statusIcon(entry.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{entry.label}</span>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Infrastructure</p>
                <Badge variant="secondary" className="text-xs">
                  Real-time
                </Badge>
              </div>
              <div className="grid gap-3">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <div key={resource.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 bg-card/60">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{resource.label}</p>
                        <p className="text-xs text-muted-foreground">{resource.sublabel}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{resource.value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SystemOverviewTemplate;
