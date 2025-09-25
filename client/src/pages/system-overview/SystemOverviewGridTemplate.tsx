import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Plus, Key, Sparkles } from "lucide-react";

interface LicenseInfo {
  type: string;
  validUntil: string;
  workerGroups: boolean;
}

interface UsageMetric {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}

interface SystemOverviewGridProps {
  scope: "instance" | "tenant";
  license: LicenseInfo;
  usage: UsageMetric[];
  storageTitle: string;
  secretsTitle: string;
  storageButtonText: string;
  secretsButtonText: string;
}

export function SystemOverviewGridTemplate({ 
  scope, 
  license, 
  usage, 
  storageTitle, 
  secretsTitle, 
  storageButtonText, 
  secretsButtonText 
}: SystemOverviewGridProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {scope === "instance" ? "Instance Administration" : "Tenant Administration"}
            </span>
            <h1 className="text-xl font-semibold text-foreground">System Overview</h1>
            <p className="text-sm text-muted-foreground">
              {scope === "instance" 
                ? "High level insight into tenant activity, agent health, and platform utilisation."
                : "Overview of your tenant's usage, resources, and configuration."
              }
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <section className="grid gap-6 p-6">
          {/* 2x2 Grid Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Left: Your license */}
            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your license</h2>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  <Sparkles className="h-4 w-4" />
                  Enterprise Edition
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License type:</span>
                  <span className="font-medium text-foreground">{license.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid until:</span>
                  <span className="font-medium text-foreground">{license.validUntil}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Worker groups:</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-foreground">Enabled</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Right: Your usage */}
            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your usage</h2>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  + Download
                </Button>
              </div>
              <div className="space-y-3">
                {usage.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/20">
                        {metric.icon}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">{metric.label}</span>
                        {metric.sublabel && (
                          <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                      <div className="h-4 w-4 text-muted-foreground">≡</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bottom Left: Your Internal Storages */}
            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{storageTitle}</h2>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {storageButtonText}
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Key className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Looks like there's no versioned plugin here... yet!
                </p>
              </div>
            </Card>

            {/* Bottom Right: Your Secrets Managers */}
            <Card className="border border-border/60 bg-card/70 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{secretsTitle}</h2>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {secretsButtonText}
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Key className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Looks like there's no versioned plugin here... yet!
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SystemOverviewGridTemplate;
