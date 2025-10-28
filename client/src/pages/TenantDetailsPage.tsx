import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import FilterInterface from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Copy,
  Pencil,
  PencilLine,
  Plus,
  Trash2,
  Star,
} from "lucide-react";

interface TenantDetailsPageProps {
  params?: {
    tenantId?: string;
  };
}

type LimitType = "Concurrency" | "Quota";
type LimitBehavior = "QUEUE" | "CANCEL" | "FAIL";

type LimitColumnId = "type" | "behavior" | "total-limit" | "interval" | "slots";

interface LimitSlotDraft {
  name: string;
  limit: number;
  isDefault: boolean;
}

interface LimitEntry {
  id: string;
  type: LimitType;
  behavior: LimitBehavior;
  totalLimit: number;
  forceConcurrencyLimit?: boolean;
  interval?: {
    preset: "hour" | "day" | "week" | "month" | "year" | "custom";
    label: string;
    value?: string;
  };
  slots?: Array<{ name: string; limit: number; default?: boolean }>;
  createdAt: string;
}

const NAVIGATION_ITEMS = ["Overview", "Limits", "Audit Logs"] as const;

const LIMIT_COLUMNS: ColumnConfig[] = [
  { id: "type", label: "Type", description: "Concurrency or quota limit", visible: true, order: 1 },
  { id: "behavior", label: "Behavior", description: "What happens when the limit is reached", visible: true, order: 2 },
  { id: "total-limit", label: "Total limit", description: "Maximum executions allowed", visible: true, order: 3 },
  { id: "interval", label: "Duration", description: "Quota duration (if applicable)", visible: true, order: 4 },
  { id: "slots", label: "Slots", description: "Slot allocations for concurrency", visible: true, order: 5 },
];

const LIMIT_TYPE_DESCRIPTIONS: Record<LimitType, string> = {
  Concurrency: "Control how many executions can run concurrently for this tenant.",
  Quota: "Control how many executions can run in a given time window for this tenant.",
};

const CONCURRENCY_BEHAVIOR_DESCRIPTIONS: Record<LimitBehavior, string> = {
  QUEUE: "Queue: additional executions wait until concurrency slots are available.",
  CANCEL: "Cancel: additional executions are cancelled when concurrency slots are exhausted.",
  FAIL: "Fail: additional executions fail immediately when concurrency slots are exhausted.",
};

const QUOTA_BEHAVIOR_EXPLANATIONS: Record<LimitBehavior, string> = {
  QUEUE: "When the quota is reached, new executions wait until the interval resets.",
  FAIL: "When the quota is reached, new executions fail with a quota exceeded error.",
  CANCEL: "When the quota is reached, new executions are cancelled due to quota exceeded.",
};

const QUOTA_INTERVAL_OPTIONS = [
  { value: "hour", label: "Per hour" },
  { value: "day", label: "Per day" },
  { value: "custom", label: "Custom (ISO 8601 duration)" },
] as const;

const INITIAL_LIMITS: LimitEntry[] = [
  {
    id: "tenant-limit-1",
    type: "Concurrency",
    behavior: "QUEUE",
    totalLimit: 100,
    forceConcurrencyLimit: false,
    slots: [
      { name: "High Priority", limit: 30 },
      { name: "Standard", limit: 60, default: true },
      { name: "Backfill", limit: 10 },
    ],
    createdAt: "2025-06-10T12:00:00Z",
  },
  {
    id: "tenant-limit-2",
    type: "Quota",
    behavior: "FAIL",
    totalLimit: 400,
    interval: {
      preset: "custom",
      label: "Custom (P1W)",
      value: "P1W",
    },
    createdAt: "2025-05-01T09:30:00Z",
  },
];

const DEFAULT_VISIBLE_FILTERS: string[] = [];

export default function TenantDetailsPage({ params }: TenantDetailsPageProps) {
  const tenantParam = params?.tenantId ?? "demo";
  const tenantId = decodeURIComponent(tenantParam);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<(typeof NAVIGATION_ITEMS)[number]>("Overview");

  const [limits, setLimits] = useState<LimitEntry[]>(INITIAL_LIMITS);
  const [limitColumns, setLimitColumns] = useState<ColumnConfig[]>(LIMIT_COLUMNS.map((column) => ({ ...column })));
  const [limitSearchValue, setLimitSearchValue] = useState("");
  const [limitVisibleFilters, setLimitVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [limitSavedFilters, setLimitSavedFilters] = useState<SavedFilter[]>([]);
  const [limitPeriodicRefresh, setLimitPeriodicRefresh] = useState(true);
  const [limitDrawerOpen, setLimitDrawerOpen] = useState(false);
  const [newLimitType, setNewLimitType] = useState<LimitType>("Concurrency");
  const [newLimitBehavior, setNewLimitBehavior] = useState<LimitBehavior>("QUEUE");
  const [newLimitForceConcurrencyLimit, setNewLimitForceConcurrencyLimit] = useState(false);
  const [newLimitTotal, setNewLimitTotal] = useState<number>(1);
  const [slotDrafts, setSlotDrafts] = useState<LimitSlotDraft[]>([]);
  const [slotLimitError, setSlotLimitError] = useState<string>("");
  const [limitFormError, setLimitFormError] = useState<string>("");
  const [quotaIntervalPreset, setQuotaIntervalPreset] = useState<typeof QUOTA_INTERVAL_OPTIONS[number]["value"]>("day");
  const [quotaCustomInterval, setQuotaCustomInterval] = useState("P1D");
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);

  useEffect(() => {
    if (newLimitType !== "Concurrency") {
      setSlotLimitError("");
      return;
    }
    const totalAllocated = slotDrafts.reduce((sum, slot) => sum + (Number.isFinite(slot.limit) ? slot.limit : 0), 0);
    if (totalAllocated > newLimitTotal) {
      setSlotLimitError("Slot allocations cannot exceed the total concurrency limit.");
    } else {
      setSlotLimitError("");
    }
  }, [newLimitType, slotDrafts, newLimitTotal]);

  const visibleLimitColumns = useMemo(
    () => limitColumns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [limitColumns],
  );

  const filteredLimits = useMemo(() => {
    const term = limitSearchValue.trim().toLowerCase();
    if (!term) {
      return limits;
    }
    return limits.filter((entry) => {
      const slotSummary = entry.slots?.map((slot) => `${slot.name}:${slot.limit}`).join(" ") ?? "";
      const intervalSummary = entry.interval?.label ?? entry.interval?.value ?? "";
      const haystack = [
        entry.type,
        entry.behavior,
        String(entry.totalLimit),
        entry.forceConcurrencyLimit ? "force concurrency limit" : "",
        intervalSummary,
        slotSummary,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [limitSearchValue, limits]);

  const limitActiveFilters: { id: string; label: string; value: string; operator?: string }[] = [];

  const resetLimitForm = () => {
    setNewLimitType("Concurrency");
    setNewLimitBehavior("QUEUE");
    setNewLimitForceConcurrencyLimit(false);
    setNewLimitTotal(1);
    setSlotDrafts([]);
    setSlotLimitError("");
    setLimitFormError("");
    setQuotaIntervalPreset("day");
    setQuotaCustomInterval("P1D");
  };

  const handleLimitDrawerChange = (open: boolean) => {
    setLimitDrawerOpen(open);
    if (!open) {
      resetLimitForm();
      setEditingLimitId(null);
    }
  };

  const handleSelectLimitType = (type: LimitType) => {
    setNewLimitType(type);
    setNewLimitBehavior("QUEUE");
    if (type === "Concurrency") {
      setSlotDrafts([]);
    } else {
      setNewLimitForceConcurrencyLimit(false);
    }
    setLimitFormError("");
  };

  const handleAddSlotDraft = () => {
    setSlotDrafts((prev) => [...prev, { name: "", limit: 1, isDefault: prev.length === 0 }]);
  };

  const handleSlotDraftChange = (index: number, field: keyof LimitSlotDraft, value: string | number | boolean) => {
    setSlotDrafts((prev) => {
      const next = [...prev];
      const slot = { ...next[index] };
      if (field === "name" && typeof value === "string") {
        slot.name = value;
      }
      if (field === "limit" && typeof value === "number") {
        slot.limit = value < 1 ? 1 : value;
      }
      if (field === "isDefault" && typeof value === "boolean") {
        slot.isDefault = value;
      }
      next[index] = slot;
      return next;
    });
  };

  const handleSlotDefaultToggle = (index: number) => {
    setSlotDrafts((prev) =>
      prev.map((slot, idx) => ({ ...slot, isDefault: idx === index ? !slot.isDefault : false })),
    );
  };

  const handleRemoveSlotDraft = (index: number) => {
    setSlotDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveLimit = () => {
    if (newLimitTotal < 1) {
      setLimitFormError("Total limit must be at least 1.");
      return;
    }

    if (newLimitType === "Concurrency" && slotLimitError) {
      return;
    }

    if (newLimitType === "Concurrency") {
      const existingConcurrency = limits.find((entry) => entry.type === "Concurrency" && entry.id !== editingLimitId);
      if (existingConcurrency) {
        setLimitFormError("Only one concurrency limit can be defined per tenant. Edit the existing concurrency limit instead.");
        return;
      }
    }

    let slotsToPersist: LimitEntry["slots"] | undefined;
    if (newLimitType === "Concurrency") {
      const normalizedSlots = slotDrafts
        .map((slot) => ({
          name: slot.name.trim(),
          limit: Math.max(1, Math.floor(slot.limit)),
          default: slot.isDefault || undefined,
        }))
        .filter((slot) => slot.name.length > 0);

      if (normalizedSlots.length > 0 && !normalizedSlots.some((slot) => slot.default)) {
        normalizedSlots[0] = { ...normalizedSlots[0], default: true };
      }

      slotsToPersist = normalizedSlots.length > 0 ? normalizedSlots : undefined;
    }

    let intervalConfig: LimitEntry["interval"] | undefined;
    if (newLimitType === "Quota") {
      if (quotaIntervalPreset === "custom") {
        if (!quotaCustomInterval.trim()) {
          setLimitFormError("Provide a valid ISO 8601 value for the custom duration.");
          return;
        }
        intervalConfig = {
          preset: "custom",
          label: `Custom (${quotaCustomInterval.trim()})`,
          value: quotaCustomInterval.trim(),
        };
      } else {
        const option = QUOTA_INTERVAL_OPTIONS.find((opt) => opt.value === quotaIntervalPreset);
        intervalConfig = option
          ? { preset: option.value, label: option.label }
          : { preset: "day", label: "Per day" };
      }
    }

    const targetId = editingLimitId ?? `tenant-limit-${Date.now()}`;
    const existingEntry = editingLimitId ? limits.find((entry) => entry.id === editingLimitId) : undefined;

    const newEntry: LimitEntry = {
      id: targetId,
      type: newLimitType,
      behavior: newLimitBehavior,
      totalLimit: Math.max(1, Math.floor(newLimitTotal)),
      forceConcurrencyLimit: newLimitType === "Concurrency" ? newLimitForceConcurrencyLimit : false,
      interval: newLimitType === "Quota" ? intervalConfig : undefined,
      slots: newLimitType === "Concurrency" ? slotsToPersist : undefined,
      createdAt: existingEntry?.createdAt ?? new Date().toISOString(),
    };

    setLimits((prev) =>
      editingLimitId
        ? prev.map((entry) => (entry.id === editingLimitId ? newEntry : entry))
        : [newEntry, ...prev],
    );
    handleLimitDrawerChange(false);
    setLimitFormError("");
  };

  const handleEditLimit = (entry: LimitEntry) => {
    setEditingLimitId(entry.id);
    setNewLimitType(entry.type);
    setNewLimitBehavior(entry.behavior);
    setNewLimitTotal(entry.totalLimit);
    setNewLimitForceConcurrencyLimit(entry.type === "Concurrency" ? !!entry.forceConcurrencyLimit : false);
    setLimitFormError("");
    setSlotLimitError("");

    if (entry.type === "Concurrency") {
      const drafts = entry.slots?.map((slot) => ({
        name: slot.name,
        limit: slot.limit,
        isDefault: !!slot.default,
      })) ?? [];
      setSlotDrafts(drafts);
      setQuotaIntervalPreset("day");
      setQuotaCustomInterval("P1D");
  } else {
    setSlotDrafts([]);
    const rawPreset = entry.interval?.preset;
    const resolvedPreset: typeof QUOTA_INTERVAL_OPTIONS[number]["value"] =
      rawPreset === "hour" || rawPreset === "day"
        ? rawPreset
        : entry.interval?.value
          ? "custom"
          : "day";
    setQuotaIntervalPreset(resolvedPreset);
    if (resolvedPreset === "custom") {
      setQuotaCustomInterval(entry.interval?.value ?? "P1D");
    } else {
      setQuotaCustomInterval("P1D");
    }
  }

    setLimitDrawerOpen(true);
  };

  const handleDeleteLimit = (id: string) => {
    setLimits((prev) => prev.filter((entry) => entry.id !== id));
    toast({ title: "Limit removed", description: "The tenant limit was deleted." });
  };

  const handleLimitClearFilter = (_filterId: string) => {
    setLimitVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setLimitSearchValue("");
  };

  const handleResetLimitFilters = () => {
    setLimitSearchValue("");
    setLimitPeriodicRefresh(true);
    setLimitVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setLimitColumns(LIMIT_COLUMNS.map((column) => ({ ...column })));
  };

  const handleResetLimitFilterById = (_filterId: string) => {
    handleResetLimitFilters();
  };

  const handleRefreshLimits = () => {
    console.log(`Refreshing limits for tenant ${tenantId}...`);
  };

  const getCurrentLimitFilterState = (): SavedFilter["filterState"] => ({
    searchValue: limitSearchValue,
    selectedStates: [],
    statesOperator: "in",
    selectedInterval: "all-time",
    intervalStartDate: undefined,
    intervalEndDate: undefined,
    selectedLabels: [],
    labelsOperator: "has-any-of",
    labelsCustomValue: "",
    selectedNamespaces: [],
    namespaceOperator: "in",
    namespaceCustomValue: "",
    selectedFlows: [],
    selectedScopes: [],
    selectedKinds: [],
    selectedHierarchy: "all",
    selectedInitialExecution: "",
    visibleFilters: limitVisibleFilters,
  });

  const handleSaveLimitFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-limits-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentLimitFilterState(),
    };
    setLimitSavedFilters((prev) => [filter, ...prev]);
  };

  const handleLoadLimitFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setLimitSearchValue(state.searchValue ?? "");
    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;
    setLimitVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteLimitFilter = (filterId: string) => {
    setLimitSavedFilters((prev) => prev.filter((filter) => filter.id !== filterId));
  };

  const handleUpdateLimitFilter = (filterId: string, name: string, description: string) => {
    setLimitSavedFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId
          ? { ...filter, name, description, updatedAt: new Date().toISOString() }
          : filter,
      ),
    );
  };

  const renderLimitCell = (entry: LimitEntry, columnId: LimitColumnId) => {
    switch (columnId) {
      case "type":
        return (
          <Badge variant="secondary" className="text-xs uppercase tracking-wide bg-muted/40">
            {entry.type}
          </Badge>
        );
      case "behavior":
        return (
          <div className="space-y-1">
            <span className="text-sm font-medium text-foreground">{entry.behavior}</span>
            {entry.forceConcurrencyLimit ? (
              <Badge
                variant="outline"
                className="inline-flex text-[10px] uppercase tracking-wide border-border/40 text-muted-foreground"
              >
                Forced concurrency
              </Badge>
            ) : null}
          </div>
        );
      case "total-limit":
        return <span className="text-sm font-semibold text-foreground">{entry.totalLimit}</span>;
      case "interval":
        return entry.type === "Quota"
          ? <span className="text-sm text-foreground">{entry.interval?.label ?? "—"}</span>
          : <span className="text-muted-foreground">—</span>;
      case "slots":
        if (entry.type === "Concurrency" && entry.slots && entry.slots.length > 0) {
          return (
            <div className="flex flex-wrap gap-3">
              {entry.slots.map((slot) => (
                <Badge
                  key={`${entry.id}-${slot.name}`}
                  variant="outline"
                  className={cn(
                    "text-xs border-border/50 text-foreground/80",
                    slot.default ? "bg-purple-500/20 border-purple-400/40 text-foreground" : "",
                  )}
                >
                  {slot.name} ({slot.limit}){slot.default ? ": default" : ""}
                </Badge>
              ))}
            </div>
          );
        }
        return <span className="text-muted-foreground">—</span>;
      default:
        return null;
    }
  };

  const saveLimitDisabled =
    newLimitTotal < 1 ||
    (newLimitType === "Concurrency" && !!slotLimitError) ||
    (newLimitType === "Quota" && quotaIntervalPreset === "custom" && !quotaCustomInterval.trim()) ||
    !!limitFormError;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/60">
        <div className="px-6 pt-6 pb-4 space-y-4 bg-[#2F3341]">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/instance/tenants">Tenants</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{tenantId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-foreground">{tenantId}</span>
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Instance administration • Tenant detail</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="outline" className="border-border/70 bg-transparent text-foreground hover:bg-muted/40">
                <PencilLine className="h-4 w-4" />
                Edit tenant
              </Button>
              <Sheet open={limitDrawerOpen} onOpenChange={handleLimitDrawerChange}>
                <SheetTrigger asChild>
                  <Button
                    className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setEditingLimitId(null);
                      resetLimitForm();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    New limit
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full border-l border-border bg-background text-foreground sm:max-w-2xl"
                >
                  <SheetHeader>
                    <SheetTitle>{editingLimitId ? "Edit limit" : "New limit"}</SheetTitle>
                    <SheetDescription>
                      Manage concurrency or quota limits for this tenant.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6 overflow-y-auto pr-2 max-h-[calc(100vh-240px)]">
                    <div className="grid grid-cols-2 rounded-md bg-muted/50 p-1 text-sm font-medium">
                      {(["Concurrency", "Quota"] as LimitType[]).map((type) => (
                        <Tooltip key={type}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleSelectLimitType(type)}
                              className={cn(
                                "rounded-md px-3 py-2 transition-colors",
                                newLimitType === type
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {type}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">{LIMIT_TYPE_DESCRIPTIONS[type]}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>

                    {limitFormError ? (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                        {limitFormError}
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Behavior *</span>
                        <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/50 p-1 text-sm font-medium">
                          {(["QUEUE", "CANCEL", "FAIL"] as LimitBehavior[]).map((behavior) => (
                            <Tooltip key={behavior}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => setNewLimitBehavior(behavior)}
                                  className={cn(
                                    "rounded-md px-3 py-2 transition-colors",
                                    newLimitBehavior === behavior
                                      ? "bg-primary text-primary-foreground shadow-sm"
                                      : "text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {behavior}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">
                                  {(newLimitType === "Quota"
                                    ? QUOTA_BEHAVIOR_EXPLANATIONS
                                    : CONCURRENCY_BEHAVIOR_DESCRIPTIONS)[behavior]}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`flex items-start justify-between gap-3 rounded-md border border-border/60 bg-muted/30 p-3 ${
                          newLimitType !== "Concurrency" ? "opacity-60" : ""
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <span className="text-sm font-medium text-foreground">Force Concurrency Limit</span>
                          <p className="text-xs text-muted-foreground">
                            When enabled, this concurrency limit overrides any higher limits set by any namespaces or flows.
                          </p>
                        </div>
                        <Switch
                          checked={newLimitForceConcurrencyLimit}
                          onCheckedChange={setNewLimitForceConcurrencyLimit}
                          disabled={newLimitType !== "Concurrency"}
                          aria-label="Force concurrency limit for this tenant"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Total limit *</span>
                        <Input
                          type="number"
                          min={1}
                          value={newLimitTotal}
                          onChange={(event) => setNewLimitTotal(Number(event.target.value) || 0)}
                        />
                      </div>

                      {newLimitType === "Concurrency" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Slots</span>
                            <Button variant="ghost" size="sm" onClick={handleAddSlotDraft} className="text-[#ADADED] hover:text-primary">
                              <Plus className="h-4 w-4" />
                              Add slot
                            </Button>
                          </div>
                          {slotDrafts.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Without slots, the total limit applies to all executions.
                            </p>
                          ) : null}
                          <div className="space-y-3">
                            {slotDrafts.map((slot, index) => (
                              <div key={`slot-${index}`} className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-4">
                                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                  <div className="space-y-1">
                                    <span className="text-xs font-medium uppercase text-muted-foreground">Slot name</span>
                                    <Input
                                      value={slot.name}
                                      onChange={(event) => handleSlotDraftChange(index, "name", event.target.value)}
                                      placeholder="e.g. high"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs font-medium uppercase text-muted-foreground">Limit</span>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={slot.limit}
                                      onChange={(event) => handleSlotDraftChange(index, "limit", Number(event.target.value) || 0)}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      id={`slot-default-${index}`}
                                      checked={slot.isDefault}
                                      onCheckedChange={() => handleSlotDefaultToggle(index)}
                                    />
                                    <span className="text-sm text-muted-foreground">Default slot</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSlotDraft(index)}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label="Remove slot"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          {slotLimitError ? <p className="text-xs text-destructive">{slotLimitError}</p> : null}
                        </div>
                      ) : null}

                      {newLimitType === "Quota" ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Duration *</span>
                            <Select
                              value={quotaIntervalPreset}
                              onValueChange={(value) => setQuotaIntervalPreset(value as typeof QUOTA_INTERVAL_OPTIONS[number]["value"])}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover text-popover-foreground">
                                {QUOTA_INTERVAL_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {quotaIntervalPreset === "custom" ? (
                            <div className="space-y-1">
                              <span className="text-xs font-medium uppercase text-muted-foreground">Custom duration (ISO 8601)</span>
                              <Input
                                value={quotaCustomInterval}
                                onChange={(event) => setQuotaCustomInterval(event.target.value)}
                                placeholder="P1D"
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <SheetFooter className="mt-6">
                    <div className="flex w-full justify-end gap-3">
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:bg-muted"
                        onClick={() => handleLimitDrawerChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                        onClick={handleSaveLimit}
                        disabled={saveLimitDisabled}
                      >
                        Save
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <nav className="-mb-2 flex flex-wrap items-center gap-1 text-sm">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  activeTab === item
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeTab === "Overview" ? (
          <div className="flex-1 overflow-auto px-6 pb-10">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card/40 p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tenant metadata</h2>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>ID: <span className="font-mono text-[#ADADED]">{tenantId}</span></p>
                  <p>Status: Active</p>
                  <p>Created: Oct 1, 2024</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card/40 p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Execution stats</h2>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Executions (30d): 1,240</p>
                  <p>Success rate: 97%</p>
                  <p>Avg duration: 32s</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Limits" ? (
          <div className="space-y-6">
            <FilterInterface
              searchValue={limitSearchValue}
              onSearchChange={setLimitSearchValue}
              activeFilters={limitActiveFilters}
              onClearFilter={handleLimitClearFilter}
              onEditFilter={() => {}}
              onResetFilters={handleResetLimitFilters}
              showChart={false}
              onToggleShowChart={() => {}}
              periodicRefresh={limitPeriodicRefresh}
              onTogglePeriodicRefresh={setLimitPeriodicRefresh}
              onRefreshData={handleRefreshLimits}
              columns={limitColumns}
              onColumnsChange={setLimitColumns}
              selectedStates={[]}
              statesOperator="in"
              onSelectedStatesChange={() => {}}
              onStatesOperatorChange={() => {}}
              selectedInterval="all-time"
              intervalStartDate={undefined}
              intervalEndDate={undefined}
              onIntervalChange={() => {}}
              selectedLabels={[]}
              labelsOperator="has-any-of"
              labelsCustomValue=""
              onLabelsSelectionChange={() => {}}
              onLabelsOperatorChange={() => {}}
              onLabelsCustomValueChange={() => {}}
              tagOptions={[]}
              selectedInputs={[]}
              inputsOperator="has-any-of"
              inputsCustomValue=""
              onInputsSelectionChange={() => {}}
              onInputsOperatorChange={() => {}}
              onInputsCustomValueChange={() => {}}
              selectedOutputs={[]}
              outputsOperator="has-any-of"
              outputsCustomValue=""
              onOutputsSelectionChange={() => {}}
              onOutputsOperatorChange={() => {}}
              onOutputsCustomValueChange={() => {}}
              selectedNamespaces={[]}
              namespaceOperator="in"
              namespaceCustomValue=""
              onNamespacesSelectionChange={() => {}}
              onNamespaceOperatorChange={() => {}}
              onNamespaceCustomValueChange={() => {}}
              namespaceOptions={[]}
              selectedFlows={[]}
              onFlowsSelectionChange={() => {}}
              selectedScopes={[]}
              onScopesSelectionChange={() => {}}
              selectedKinds={[]}
              onKindsSelectionChange={() => {}}
              selectedHierarchy="all"
              onHierarchySelectionChange={() => {}}
              selectedInitialExecution=""
              onInitialExecutionSelectionChange={() => {}}
              actorValue=""
              onActorChange={() => {}}
              selectedActions={[]}
              actionsOperator="in"
              onActionsSelectionChange={() => {}}
              onActionsOperatorChange={() => {}}
              selectedResources={[]}
              resourcesOperator="in"
              onResourcesSelectionChange={() => {}}
              onResourcesOperatorChange={() => {}}
              userValue=""
              onUserChange={() => {}}
              selectedSuperadminStatuses={[]}
              superadminOperator="in"
              onSuperadminSelectionChange={() => {}}
              onSuperadminOperatorChange={() => {}}
              selectedInvitationStatuses={[]}
              invitationStatusOperator="in"
              onInvitationStatusesChange={() => {}}
              onInvitationStatusOperatorChange={() => {}}
              invitationStatusOptions={[]}
              savedFilters={limitSavedFilters}
              onSaveFilter={handleSaveLimitFilter}
              onLoadFilter={handleLoadLimitFilter}
              onDeleteFilter={handleDeleteLimitFilter}
              onUpdateFilter={handleUpdateLimitFilter}
              visibleFilters={limitVisibleFilters}
              onVisibleFiltersChange={setLimitVisibleFilters}
              onResetFilter={handleResetLimitFilterById}
              filterOptions={[]}
              searchPlaceholder="Search limits"
              showChartToggleControl={false}
            />

            <div className="rounded-lg border border-border/60 bg-card/40 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed text-sm">
                  <thead>
                    <tr className="bg-muted/60 text-muted-foreground">
                      {visibleLimitColumns.map((column) => (
                        <th key={column.id} className="px-4 py-3 text-left font-semibold">
                          {column.label}
                        </th>
                      ))}
                      <th className="w-[120px] px-4 py-3 text-right font-semibold">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLimits.length === 0 ? (
                      <tr>
                        <td colSpan={visibleLimitColumns.length + 1} className="px-6 py-10 text-center text-sm text-muted-foreground">
                          No limits defined yet.
                        </td>
                      </tr>
                    ) : (
                      filteredLimits.map((entry) => (
                        <tr key={entry.id} className="border-t border-border/50 bg-card/60">
                          {visibleLimitColumns.map((column) => (
                            <td key={column.id} className="px-4 py-3 align-top">
                              {renderLimitCell(entry, column.id as LimitColumnId)}
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-muted"
                                aria-label="Edit limit"
                                onClick={() => handleEditLimit(entry)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-destructive/20"
                                aria-label="Delete limit"
                                onClick={() => handleDeleteLimit(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            Content for this section will be available soon.
          </div>
        )}
      </main>
    </div>
  );
}
