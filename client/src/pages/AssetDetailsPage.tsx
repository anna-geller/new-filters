import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AssetFlowLink } from "@/types/assets";
import ExecutionsPage from "@/pages/ExecutionsPage";
import { ArrowLeft, Link2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  deleteCustomAsset,
  getAllAssets,
  getAssetById,
  isCustomAsset,
  subscribeToAssetChanges,
} from "@/utils/assetCatalog";
import type { AssetRecord } from "@/types/assets";

interface AssetDetailsPageProps {
  params?: {
    assetId?: string;
  };
}

interface DependencyDisplayItem {
  id: string;
  label: string;
  category: "Asset" | "App" | "Flow";
  detail?: string;
  href?: string;
  namespace?: string;
}

const CHIP_COLORS = {
  asset: {
    fill: "#2563eb",
    border: "border-blue-500/40",
    badge: "bg-blue-500/10 text-blue-100 border-blue-500/40",
  },
  app: {
    fill: "#10b981",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-100 border-emerald-500/40",
  },
  flow: {
    fill: "#8b5cf6",
    border: "border-purple-500/40",
    badge: "bg-purple-500/10 text-purple-100 border-purple-500/40",
  },
  primary: {
    fill: "#5b21b6",
    border: "border-primary/60",
    badge: "bg-primary/15 text-primary-100 border-primary/60",
  },
} as const;

function formatToken(token: string): string {
  return token
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function AssetDetailsPage({ params }: AssetDetailsPageProps) {
  const assetId = params?.assetId ?? "";
  const [allAssets, setAllAssets] = useState<AssetRecord[]>(() => getAllAssets());
  const assetMap = useMemo(() => {
    const map = new Map<string, AssetRecord>();
    allAssets.forEach((record) => {
      map.set(record.id, record);
    });
    return map;
  }, [allAssets]);

  const asset = assetId ? assetMap.get(assetId) : undefined;
  const [activeTab, setActiveTab] = useState("overview");
  const [dependencySearch, setDependencySearch] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (!asset) {
    return (
      <div className="min-h-screen bg-[#1F232D] text-foreground flex items-center justify-center px-6">
        <Card className="max-w-lg p-8 space-y-4 bg-[#262A35] border-border">
          <div className="text-lg font-semibold">Asset not found</div>
          <p className="text-sm text-muted-foreground">
            We couldn’t locate that asset. It may have been removed or the identifier could be incorrect.
          </p>
          <Link href="/assets" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Assets
          </Link>
        </Card>
      </div>
    );
  }

  const assetLabel = asset.displayName ?? asset.id;

  useEffect(() => {
    const unsubscribe = subscribeToAssetChanges(() => {
      setAllAssets(getAllAssets());
    });

    return unsubscribe;
  }, []);

  const formatValueContent = (value: unknown): { content: string; multiline: boolean } => {
    if (value === null || typeof value === "undefined") {
      return { content: "—", multiline: false };
    }

    if (typeof value === "string") {
      return { content: value, multiline: value.includes("\n") };
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return { content: String(value), multiline: false };
    }

    const serialized = JSON.stringify(value, null, 2);
    return { content: serialized, multiline: true };
  };

  const handleEditAsset = () => {
    toast({
      title: "Edit asset",
      description: "Inline editing coming soon. For now, update asset metadata through the API.",
    });
  };

  const handleDeleteAsset = () => {
    if (!asset) {
      return;
    }

    if (!isCustomAsset(asset.id)) {
      toast({
        title: "Protected asset",
        description: "System assets cannot be deleted from the UI.",
        variant: "destructive",
      });
      return;
    }

    deleteCustomAsset(asset.id);
    toast({
      title: "Asset deleted",
      description: `${asset.displayName ?? asset.id} was removed.`,
    });
    setLocation("/assets");
  };

  const relatedAssetItems = useMemo(
    () =>
      (asset.relatedAssets ?? []).map((relatedId) => {
        const relatedAsset = assetMap.get(relatedId);
        return {
          id: relatedId,
          label: relatedAsset?.displayName ?? relatedId,
          category: "Asset" as const,
          detail: relatedAsset?.type ?? "Asset",
          href: `/assets/${relatedId}`,
        };
      }),
    [asset.relatedAssets, assetMap],
  );

  const relatedAppItems = useMemo(
    () =>
      (asset.relatedApps ?? []).map((appId) => ({
        id: appId,
        label: formatToken(appId),
        category: "App" as const,
        detail: appId,
        href: `/apps?search=${encodeURIComponent(appId)}`,
      })),
    [asset.relatedApps],
  );

  const relatedFlowItems = useMemo(
    () =>
      (asset.relatedFlows ?? []).map((flow: AssetFlowLink) => {
        const namespace = flow.namespace ?? "";
        return {
          id: flow.flow,
          label: flow.flow,
          category: "Flow" as const,
          detail: namespace || undefined,
          namespace,
          href: namespace
            ? `/flows?namespace=${encodeURIComponent(namespace)}&flow=${encodeURIComponent(flow.flow)}`
            : `/flows?flow=${encodeURIComponent(flow.flow)}`,
        };
      }),
    [asset.relatedFlows],
  );

  const dependencyRows = useMemo<DependencyDisplayItem[]>(
    () => [
      {
        id: asset.id,
        label: assetLabel,
        category: "Asset",
        detail: asset.type,
      },
      ...relatedAssetItems,
      ...relatedAppItems,
      ...relatedFlowItems,
    ],
    [asset.id, asset.type, assetLabel, relatedAssetItems, relatedAppItems, relatedFlowItems],
  );

  const filteredDependencies = useMemo(() => {
    const query = dependencySearch.trim().toLowerCase();
    if (!query) return dependencyRows;
    return dependencyRows.filter((item) => {
      const haystack = [item.label, item.detail ?? "", item.id, item.category, item.namespace ?? ""].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [dependencyRows, dependencySearch]);

  const legendItems = [
    { label: "Asset", color: CHIP_COLORS.asset.fill },
    { label: "App", color: CHIP_COLORS.app.fill },
    { label: "Flow", color: CHIP_COLORS.flow.fill },
  ];

  const [selectedNodeId, setSelectedNodeId] = useState<string>(asset.id);

  const graphNodes = useMemo(() => {
    const minSpacing = 56;
    const baseWidth = 680;
    const baseHeight = 320;
    const maxNodeCount = Math.max(
      relatedAssetItems.length,
      relatedFlowItems.length,
      relatedAppItems.length,
    );
    const height = Math.max(baseHeight, 220 + (maxNodeCount + 1) * minSpacing);
    const width = baseWidth;
    const center = { x: width / 2, y: height / 2 };

    const distribute = (count: number, span: number, padding: number) => {
      if (count <= 0) {
        return [];
      }
      return Array.from({ length: count }, (_, index) => {
        const step = span / (count + 1);
        return padding + step * (index + 1);
      });
    };

    const verticalSpan = height - 160;
    const assetYPositions = distribute(relatedAssetItems.length, verticalSpan, 80);
    const flowYPositions = distribute(relatedFlowItems.length, verticalSpan, 80);
    const appXPositions = distribute(relatedAppItems.length, width - 200, 100);
    const appRowY = height - 90;

    const nodeEntries: Array<{
      id: string;
      label: string;
      type: "asset" | "app" | "flow" | "primary";
      x: number;
      y: number;
      namespace?: string;
    }> = [
      {
        id: asset.id,
        label: asset.id,
        type: "primary",
        x: center.x,
        y: center.y,
      },
      ...relatedAssetItems.map((item, index) => ({
        id: item.id,
        label: item.id,
        type: "asset" as const,
        x: width * 0.18,
        y: assetYPositions[index] ?? center.y,
      })),
      ...relatedFlowItems.map((item, index) => ({
        id: item.id,
        label: item.id,
        type: "flow" as const,
        namespace: item.namespace,
        x: width * 0.82,
        y: flowYPositions[index] ?? center.y,
      })),
      ...relatedAppItems.map((item, index) => ({
        id: item.id,
        label: item.id,
        type: "app" as const,
        x: appXPositions[index] ?? center.x,
        y: appRowY,
      })),
    ];

    return { nodes: nodeEntries, size: { width, height }, center };
  }, [asset.id, relatedAssetItems, relatedFlowItems, relatedAppItems]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  useEffect(() => {
    if (!filteredDependencies.some((item) => item.id === selectedNodeId)) {
      const fallback = filteredDependencies[0]?.id ?? asset.id;
      setSelectedNodeId(fallback);
    }
  }, [filteredDependencies, selectedNodeId, asset.id]);

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
              <div className="flex flex-col gap-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  <Link href="/assets" className="transition-colors hover:text-foreground">
                    Assets /
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-foreground">{assetLabel}</h1>
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide bg-[#32384A] text-foreground">
                    {asset.type}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-border/60 bg-[#1F232D] hover:bg-[#262A35]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-[#2F3341] border-border/60">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleDeleteAsset();
                      }}
                      className="text-destructive focus:bg-destructive/10"
                    >
                      Delete asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="default"
                  onClick={handleEditAsset}
                  className="bg-[#8408FF] hover:bg-[#8613f7]"
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-px w-full bg-border/60" />
              <TabsList className="flex justify-start gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="executions"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]"
                >
                  Executions
                </TabsTrigger>
                <TabsTrigger
                  value="dependencies"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]"
                >
                  Dependencies
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 bg-[#262A35] border-border">
              <div className="text-sm font-semibold mb-4">Asset values</div>
              {asset.values && Object.keys(asset.values).length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(asset.values).map(([key, value]) => {
                    const formatted = formatValueContent(value);
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{formatToken(key)}</span>
                        {formatted.multiline ? (
                          <pre className="text-xs md:text-sm text-foreground/90 bg-[#1A1E29] border border-border/40 rounded-md p-2 whitespace-pre-wrap break-words">
                            {formatted.content}
                          </pre>
                        ) : (
                          <span className="text-sm text-foreground break-words">{formatted.content}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No values captured for this asset yet.</p>
              )}
            </Card>

            <Card className="p-6 bg-[#262A35] border-border">
              <div className="text-sm font-semibold mb-4">Related resources</div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Assets</div>
                  <div className="flex flex-col gap-2">
                    {relatedAssetItems.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      relatedAssetItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className="text-sm text-foreground/80 hover:underline"
                        >
                          {item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Apps</div>
                  <div className="flex flex-col gap-2">
                    {relatedAppItems.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      relatedAppItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className="text-sm text-foreground/80 hover:underline"
                        >
                          {item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Flows</div>
                  <div className="flex flex-col gap-2">
                    {relatedFlowItems.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      relatedFlowItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className="text-sm text-foreground/80 hover:underline"
                        >
                          {item.namespace ? `${item.namespace}/${item.label}` : item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="executions">
            <ExecutionsPage assetId={asset.id} embedded heading={`Executions referencing ${assetLabel}`} />
          </TabsContent>

          <TabsContent value="dependencies">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <Card className="p-6 bg-[#262A35] border-border space-y-6">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {legendItems.map((item) => (
                    <span key={item.label} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <svg
                    viewBox={`0 0 ${graphNodes.size.width} ${graphNodes.size.height}`}
                    className="w-full"
                    style={{ height: graphNodes.size.height }}
                  >
                    {graphNodes.nodes
                      .filter((node) => node.id !== asset.id)
                      .map((node) => (
                        <line
                          key={`edge-${node.id}`}
                          x1={graphNodes.center.x}
                          y1={graphNodes.center.y}
                          x2={node.x}
                          y2={node.y}
                          stroke="#373B4A"
                          strokeWidth={1.2}
                          strokeLinecap="round"
                        />
                      ))}

                    {graphNodes.nodes.map((node) => {
                      const styleKey = node.type === "primary" ? "primary" : node.type;
                      const color = CHIP_COLORS[styleKey].fill;
                      const isSelected = node.id === selectedNodeId;
                      const radius = node.type === "primary" ? 22 : 16;
                      const haloRadius = radius + (isSelected ? 6 : 3);

                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer"
                          onClick={() => handleNodeSelect(node.id)}
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={haloRadius}
                            fill="#11141F"
                            opacity={0.85}
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius}
                            fill={color}
                            stroke={isSelected ? "#C4B5FD" : "#1F232D"}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                          <text
                            x={node.x}
                            y={node.y + radius + 12}
                            textAnchor="middle"
                            className="fill-muted-foreground text-xs font-mono"
                          >
                            {node.id}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </Card>

              <Card className="p-6 bg-[#262A35] border-border space-y-4">
                <div>
                  <div className="text-sm font-semibold">Dependency catalog</div>
                  <p className="text-sm text-muted-foreground">
                    Search linked assets, apps, and flows. Selecting an entry highlights it in the graph.
                  </p>
                </div>
                <Input
                  value={dependencySearch}
                  onChange={(event) => setDependencySearch(event.target.value)}
                  placeholder="Search dependencies..."
                  className="bg-[#1F232D] border-border/70"
                />
                <div className="space-y-2">
                  {filteredDependencies.length === 0 ? (
                    <div className="rounded-md border border-border/50 px-3 py-4 text-center text-xs text-muted-foreground">
                      No dependencies match your search.
                    </div>
                  ) : (
                    filteredDependencies.map((item) => {
                      const kind = item.category === 'Flow' ? 'flow' : item.category === 'App' ? 'app' : 'asset';
                      const isPrimary = item.id === asset.id;
                      const badgeKey = (isPrimary ? 'primary' : kind) as keyof typeof CHIP_COLORS;
                      const isActive = item.id === selectedNodeId;
                      return (
                        <div
                          key={`${item.category}-${item.id}`}
                          className={`flex items-center gap-3 rounded-md border px-3 py-2 transition ${
                            isActive ? 'border-primary/50 bg-white/10' : 'border-border/50 bg-[#1F232D] hover:bg-white/5'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleNodeSelect(item.id)}
                            className="flex flex-1 flex-col items-start gap-1 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${CHIP_COLORS[badgeKey].badge}`}>
                                {item.category}
                              </span>
                              <span className="font-mono text-sm text-foreground">{item.id}</span>
                            </div>
                            {item.category === 'Flow' && item.namespace ? (
                              <div className="font-mono text-xs text-muted-foreground">{item.namespace}</div>
                            ) : null}
                          </button>
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Open ${item.category.toLowerCase()} ${item.id}`}
                            >
                              <Link2 className="h-4 w-4" />
                            </Link>
                          ) : (
                            <Link2 className="h-4 w-4 text-muted-foreground/30" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </main>
      </div>
    </Tabs>
  );
}
