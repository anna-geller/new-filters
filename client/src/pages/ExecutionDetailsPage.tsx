import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXECUTION_FIXTURES, type ExecutionRecord } from "@/pages/ExecutionsPage";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { parseAssetKey } from "@/utils/assetKeys";

interface ExecutionDetailsPageProps {
  params?: {
    executionId?: string;
  };
}

const stateStyles: Record<ExecutionRecord["state"], string> = {
  SUCCESS: "bg-green-900/30 text-green-300 border-green-700",
  FAILED: "bg-red-900/30 text-red-300 border-red-700",
  RUNNING: "bg-blue-900/30 text-blue-300 border-blue-700",
  QUEUED: "bg-yellow-900/30 text-yellow-200 border-yellow-600",
  WARNING: "bg-orange-900/30 text-orange-300 border-orange-700",
  PAUSED: "bg-slate-900/30 text-slate-200 border-slate-600",
  CREATED: "bg-purple-900/30 text-purple-300 border-purple-700",
  RESTARTED: "bg-teal-900/30 text-teal-300 border-teal-600",
  CANCELLED: "bg-rose-900/30 text-rose-300 border-rose-600",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function ExecutionDetailsPage({ params }: ExecutionDetailsPageProps) {
  const executionId = params?.executionId ?? "";
  const [, setLocation] = useLocation();

  const execution = useMemo(() => EXECUTION_FIXTURES.find((item) => item.id === executionId), [executionId]);

  if (!execution) {
    return (
      <div className="min-h-screen bg-[#1F232D] text-foreground flex items-center justify-center px-6">
        <Card className="max-w-lg w-full space-y-4 border-border bg-[#262A35] p-8 text-center">
          <h1 className="text-xl font-semibold">Execution not found</h1>
          <p className="text-sm text-muted-foreground">
            The execution you are looking for does not exist or has been cleaned up.
          </p>
          <Button variant="outline" onClick={() => setLocation("/executions")} className="mx-auto">
            Back to executions
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F232D] text-foreground">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Link href="/executions" className="hover:text-foreground">
                Executions
              </Link>
              <span>/</span>
              <span>{execution.id}</span>
            </div>
            <h1 className="text-xl font-semibold">Execution details</h1>
          </div>
          <Button variant="outline" onClick={() => setLocation("/executions")}
            className="border-border/60 bg-[#1F232D] hover:bg-[#262A35]">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        <Card className="border-border bg-[#262A35] p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Execution {execution.id}</h2>
              <div className="text-sm text-muted-foreground">
                {execution.namespace} · {execution.flow}
              </div>
            </div>
            <Badge variant="outline" className={`text-xs uppercase tracking-wide border ${stateStyles[execution.state]}`}>
              {execution.state}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs uppercase text-muted-foreground">Started</div>
              <div className="text-sm">{formatDate(execution.startDate)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase text-muted-foreground">Ended</div>
              <div className="text-sm">{formatDate(execution.endDate)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase text-muted-foreground">Duration</div>
              <div className="text-sm">{execution.duration}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase text-muted-foreground">Task ID</div>
              <div className="text-sm font-mono">{execution.taskId}</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-[#262A35] p-6 space-y-3">
            <h3 className="text-sm font-semibold">Labels</h3>
            {execution.labels.length === 0 ? (
              <span className="text-xs text-muted-foreground">No labels recorded.</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {execution.labels.map((label) => (
                  <Badge key={label} variant="outline" className="text-xs border-border/50">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-border bg-[#262A35] p-6 space-y-3">
            <h3 className="text-sm font-semibold">Related assets</h3>
            {execution.assets && execution.assets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {execution.assets.map((assetRef) => {
                  const { namespace, id } = parseAssetKey(assetRef);
                  const display = namespace && id ? `${namespace}/${id}` : assetRef;
                  const href = namespace && id ? `/assets/${namespace}/${id}` : undefined;
                  const badge = (
                    <Badge variant="outline" className="text-xs border-border/50 hover:border-primary/60" title={display}>
                      {display}
                    </Badge>
                  );
                  if (!href) {
                    return (
                      <span key={assetRef} className="no-underline">
                        {badge}
                      </span>
                    );
                  }
                  return (
                    <Link key={assetRef} href={href} className="no-underline">
                      {badge}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No asset references.</span>
            )}
          </Card>
        </div>

        <Card className="border-border bg-[#262A35] p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ExternalLink className="h-4 w-4" />
            Flow reference
          </div>
          <div className="text-sm text-muted-foreground">
            View other executions for flow <span className="font-mono text-foreground">{execution.flow}</span> in namespace
            <span className="font-mono text-foreground"> {execution.namespace}</span>.
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation(`/executions?flow=${encodeURIComponent(execution.flow)}`)}
            className="w-full md:w-auto border-border/60 bg-[#1F232D] hover:bg-[#262A35]"
          >
            Open executions list
          </Button>
        </Card>
      </main>
    </div>
  );
}
