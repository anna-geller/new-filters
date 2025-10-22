import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FLOWS } from "@/data/flows";
import type { FlowRow } from "@/components/FlowsTable";
import ExecutionsPage from "@/pages/ExecutionsPage";
import { defaultColumns } from "@/components/ExecutionsTable";
import { EXECUTION_FIXTURES } from "@/pages/ExecutionsPage";
import { MoreVertical, Pencil, Play } from "lucide-react";

interface FlowDetailsPageProps {
  params?: {
    namespace?: string;
    flowId?: string;
  };
}

const TAB_CONFIG = [
  { id: "overview", label: "Overview" },
  { id: "topology", label: "Topology" },
  { id: "executions", label: "Executions" },
  { id: "edit", label: "Edit" },
  { id: "revisions", label: "Revisions" },
  { id: "triggers", label: "Triggers" },
  { id: "logs", label: "Logs" },
  { id: "metrics", label: "Metrics" },
  { id: "dependencies", label: "Dependencies" },
  { id: "concurrency", label: "Concurrency" },
  { id: "audit-logs", label: "Audit Logs" },
] as const;

const TAB_TRIGGER_CLASSES =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]";

const STATUS_BADGE_STYLES: Record<string, string> = {
  SUCCESS: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  FAILED: "bg-red-500/15 text-red-300 border-red-400/40",
  RUNNING: "bg-blue-500/20 text-blue-200 border-blue-400/40",
  QUEUED: "bg-yellow-500/15 text-yellow-200 border-yellow-400/40",
};

function decodeParam(value?: string) {
  if (!value) {
    return "";
  }
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function renderPlaceholderCard(title: string, description: string) {
  return (
    <Card className="p-6 bg-[#262A35] border-border space-y-2">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

export default function FlowDetailsPage({ params }: FlowDetailsPageProps) {
  const namespaceParam = decodeParam(params?.namespace);
  const flowIdParam = decodeParam(params?.flowId);

  const flow = useMemo<FlowRow | undefined>(
    () =>
      FLOWS.find(
        (item) =>
          item.id === flowIdParam &&
          (namespaceParam ? item.namespace === namespaceParam : true),
      ),
    [flowIdParam, namespaceParam],
  );

  const [activeTab, setActiveTab] = useState<string>("overview");

  const concurrencyExecutions = useMemo(() => {
    if (!flow) {
      return [];
    }
    const behavior = flow.concurrency?.behavior ?? 'QUEUE';
    const allowedStates: string[] = ['RUNNING', 'QUEUED'];
    if (behavior === 'CANCEL') {
      allowedStates.push('CANCELLED');
    }
    if (behavior === 'FAIL') {
      allowedStates.push('FAILED');
    }
    return EXECUTION_FIXTURES.filter(
      (execution) =>
        execution.flow === flow.id &&
        execution.namespace === flow.namespace &&
        allowedStates.includes(execution.state),
    );
  }, [flow]);

  const concurrencyColumns = useMemo(() => {
    const visibleColumnIds = new Set([
      'id',
      'start-date',
      'end-date',
      'duration',
      'concurrency-slot',
      'state',
      'actions',
    ]);
    return defaultColumns.map((column) => ({
      ...column,
      visible: visibleColumnIds.has(column.id),
    }));
  }, []);

  if (!flow) {
    return (
      <div className="min-h-screen bg-[#1F232D] text-foreground flex items-center justify-center px-6">
        <Card className="max-w-lg p-8 space-y-4 bg-[#262A35] border-border">
          <div className="text-lg font-semibold">Flow not found</div>
          <p className="text-sm text-muted-foreground">
            The flow you are looking for could not be located. It may have been removed or the identifier is incorrect.
          </p>
          <Link href="/flows" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            Back to flows
          </Link>
        </Card>
      </div>
    );
  }

  const concurrencyConfig = flow.concurrency ?? {
    behavior: 'QUEUE' as const,
    status: (concurrencyExecutions.some((execution) => execution.state === 'RUNNING') ? 'RUNNING' : 'QUEUED') as 'RUNNING' | 'QUEUED',
    limit: Math.max(concurrencyExecutions.length, 1),
  };

  const slotDefinitions = useMemo(() => {
    if (concurrencyConfig.slots && concurrencyConfig.slots.length > 0) {
      return concurrencyConfig.slots;
    }
    const fallbackLimit = concurrencyConfig.limit && concurrencyConfig.limit > 0 ? concurrencyConfig.limit : Math.max(concurrencyExecutions.length, 1);
    return [
      {
        id: 'default',
        label: 'Default',
        limit: fallbackLimit,
        default: true,
      },
    ];
  }, [concurrencyConfig, concurrencyExecutions.length]);

  const defaultSlotId = slotDefinitions.find((slot) => slot.default)?.id ?? slotDefinitions[0]?.id ?? 'default';

  const slotUsage = useMemo(() => {
    const behavior = concurrencyConfig.behavior ?? 'QUEUE';
    const usageMap = new Map<string, { active: number; queued: number }>();
    slotDefinitions.forEach((slot) => {
      usageMap.set(slot.id, { active: 0, queued: 0 });
    });

    concurrencyExecutions.forEach((execution) => {
      const slotKey = execution.concurrencySlot ?? defaultSlotId;
      const resolvedKey = usageMap.has(slotKey) ? slotKey : defaultSlotId;
      const usage = usageMap.get(resolvedKey) ?? { active: 0, queued: 0 };
      if (!usageMap.has(resolvedKey)) {
        usageMap.set(resolvedKey, usage);
      }
      if (execution.state === 'RUNNING') {
        usage.active += 1;
      } else if (execution.state === 'QUEUED') {
        usage.queued += 1;
      }
    });

    return slotDefinitions.map((slot) => {
      const usage = usageMap.get(slot.id) ?? { active: 0, queued: 0 };
      const limit = slot.limit > 0 ? slot.limit : Math.max(usage.active + usage.queued, 1);
      const availableCapacity = Math.max(limit - usage.active, 0);
      const overflowQueued = Math.max(usage.queued - availableCapacity, 0);
      const percentage = limit > 0 ? Math.min(100, Math.round((usage.active / limit) * 100)) : 0;
      return {
        ...slot,
        active: usage.active,
        queued: behavior === 'QUEUE' ? overflowQueued : 0,
        limit,
        percentage,
      };
    });
  }, [slotDefinitions, concurrencyExecutions, defaultSlotId, concurrencyConfig.behavior]);

  const totalActive = slotUsage.reduce((sum, slot) => sum + slot.active, 0);
  const totalQueued = slotUsage.reduce((sum, slot) => sum + slot.queued, 0);
  const totalLimitFromSlots = slotUsage.reduce((sum, slot) => sum + slot.limit, 0);
  const totalLimit = concurrencyConfig.limit ?? totalLimitFromSlots;
  const effectiveLimit = totalLimit > 0 ? totalLimit : totalLimitFromSlots;

  const statusLabel = concurrencyConfig.status ?? (totalQueued > 0 ? 'QUEUED' : 'RUNNING');
  const concurrencyStatusClass = STATUS_BADGE_STYLES[statusLabel] ?? 'bg-[#32384A] text-foreground border-transparent';

  const formatSlotLabel = (value: string) =>
    value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="min-h-screen bg-[#1F232D] text-foreground"
    >
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-[#262A35]">
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Link href="/flows" className="transition-colors hover:text-foreground">
                    FLOWS
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground/80">{namespaceParam || flow.namespace}</span>
                  <span className="text-muted-foreground">/</span>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">{flow.id}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-[#2F3341]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Edit flow</TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-border/60 bg-[#1F232D] hover:bg-[#2F3341]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-[#2F3341] border-border/60">
                    <DropdownMenuItem className="text-sm text-foreground/80 hover:bg-white/5">View history</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-foreground/80 hover:bg-white/5">Duplicate flow</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-foreground/80 hover:bg-white/5">Disable flow</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="bg-[#8408FF] hover:bg-[#8613f7] text-white gap-2">
                  <Play className="h-4 w-4" />
                  Execute
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-px w-full bg-border/60" />
              <TabsList className="flex justify-start gap-1 bg-transparent p-0 overflow-x-auto">
                {TAB_CONFIG.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className={TAB_TRIGGER_CLASSES}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </header>

        <main
          className={`flex-1 overflow-y-auto px-6 space-y-6 ${
            activeTab === "executions" ? "pt-0 pb-6" : "py-6"
          }`}
        >
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 bg-[#262A35] border-border space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Metadata</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Namespace</div>
                    <div className="font-mono text-sm text-foreground">{flow.namespace}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Revision</div>
                    <div className="font-mono text-sm text-foreground">{flow.revision}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Last execution</div>
                    <div className="text-sm text-foreground/80">{flow.lastExecutionDate}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Triggers</div>
                    <div className="flex flex-wrap gap-2">
                      {flow.triggers.length > 0 ? (
                        flow.triggers.map((trigger) => (
                          <Badge key={trigger} variant="outline" className="text-xs border-border/60">
                            {trigger}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Labels</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {flow.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs bg-[#32384A] text-foreground">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {flow.description || "No description available."}
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="topology">
            {renderPlaceholderCard(
              "Topology",
              "This tab will display topology information, including the flow graph and task relationships.",
            )}
          </TabsContent>

          <TabsContent value="executions" className="space-y-4">
            <ExecutionsPage embedded flowId={flow.id} flowNamespace={flow.namespace} />
          </TabsContent>

          <TabsContent value="edit">
            {renderPlaceholderCard(
              "Edit",
              "This tab will display editing capabilities for updating flow configuration and metadata.",
            )}
          </TabsContent>

          <TabsContent value="revisions">
            {renderPlaceholderCard(
              "Revisions",
              "This tab will display revision history and version comparison tools for the flow.",
            )}
          </TabsContent>

          <TabsContent value="triggers">
            {renderPlaceholderCard(
              "Triggers",
              "This tab will display trigger configuration and invocation history for the flow.",
            )}
          </TabsContent>

          <TabsContent value="logs">
            {renderPlaceholderCard(
              "Logs",
              "This tab will display aggregated execution logs and streaming log viewers for the flow.",
            )}
          </TabsContent>

          <TabsContent value="metrics">
            {renderPlaceholderCard(
              "Metrics",
              "This tab will display performance metrics and health indicators for the flow.",
            )}
          </TabsContent>

          <TabsContent value="dependencies">
            {renderPlaceholderCard(
              "Dependencies",
              "This tab will display upstream and downstream dependencies associated with the flow.",
            )}
          </TabsContent>

          <TabsContent value="audit-logs">
            {renderPlaceholderCard(
              "Audit Logs",
              "This tab will display audit events and security-relevant activity for the flow.",
            )}
          </TabsContent>

          <TabsContent value="concurrency" className="space-y-6">
            <Card className="bg-[#262A35] border-border p-6 space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`text-xs uppercase tracking-wide border ${concurrencyStatusClass}`}>
                    {statusLabel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Behavior: <span className="text-foreground font-semibold">{concurrencyConfig.behavior}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Active:
                    <span className="ml-1 text-foreground font-semibold">{totalActive}</span>
                    {effectiveLimit > 0 ? <span>/{effectiveLimit}</span> : null}
                  </span>
                  {concurrencyConfig.behavior === 'QUEUE' ? (
                    <span>
                      Queued:
                      <span className="ml-1 text-foreground font-semibold">{totalQueued}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {slotUsage.map((slot) => (
                <Card key={slot.id} className="bg-[#262A35] border-border p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      {formatSlotLabel(slot.label ?? slot.id)}
                    </div>
                    {slot.default ? (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide bg-[#3D2F5F] text-[#C4B5FD]">
                        Default
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active</span>
                    <span className="text-foreground font-semibold">
                      {slot.active}/{slot.limit}
                    </span>
                  </div>
                  {concurrencyConfig.behavior === 'QUEUE' ? (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Queued</span>
                      <span>{slot.queued}</span>
                    </div>
                  ) : null}
                  <div className="h-2 w-full rounded-full border border-border/60 bg-[#1A1E29] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#A78BFA] to-[#6D28D9]"
                      style={{ width: `${slot.percentage}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <ExecutionsPage
              flowId={flow.id}
              flowNamespace={flow.namespace}
              datasetOverride={concurrencyExecutions}
              initialColumns={concurrencyColumns}
              hideHeader
              layout="section"
            />
          </TabsContent>
        </main>
      </div>
    </Tabs>
  );
}
