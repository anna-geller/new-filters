import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FilterInterface from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Info,
  RotateCcw,
  CheckCircle,
  Play,
  XCircle,
  X,
  AlertTriangle,
  Pause,
  Ban,
  SkipForward,
  Clock,
  RefreshCw,
  Circle,
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

interface ExecutionStateSynonym {
  id: string;
  tenantId: string;
  defaultState: string;
  synonym: string;
  createdAt: Date | string;
}

interface ExecutionStateConfig {
  id: string;
  label: string;
  icon: typeof Info;
  description: string;
  color: string;
}

const NAVIGATION_ITEMS = ["Overview", "Limits", "Execution states", "Audit Logs"] as const;

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

const EXECUTION_STATE_CONFIGS: ExecutionStateConfig[] = [
  { id: "CREATED", label: "CREATED", icon: Info, description: "Execution has been created", color: "bg-purple-900/30 text-purple-300 border-purple-700" },
  { id: "RESTARTED", label: "RESTARTED", icon: RotateCcw, description: "Execution has been restarted", color: "bg-teal-900/30 text-teal-300 border-teal-600" },
  { id: "SUCCESS", label: "SUCCESS", icon: CheckCircle, description: "Execution completed successfully", color: "bg-green-900/30 text-green-300 border-green-700" },
  { id: "RUNNING", label: "RUNNING", icon: Play, description: "Execution is currently running", color: "bg-blue-900/30 text-blue-300 border-blue-700" },
  { id: "KILLING", label: "KILLING", icon: XCircle, description: "Execution is being killed", color: "bg-red-900/30 text-red-300 border-red-700" },
  { id: "KILLED", label: "KILLED", icon: X, description: "Execution has been killed", color: "bg-red-900/30 text-red-300 border-red-700" },
  { id: "WARNING", label: "WARNING", icon: AlertTriangle, description: "Execution completed with warnings", color: "bg-yellow-900/30 text-yellow-300 border-yellow-700" },
  { id: "FAILED", label: "FAILED", icon: XCircle, description: "Execution has failed", color: "bg-red-900/30 text-red-300 border-red-700" },
  { id: "PAUSED", label: "PAUSED", icon: Pause, description: "Execution has been paused", color: "bg-orange-900/30 text-orange-300 border-orange-700" },
  { id: "CANCELLED", label: "CANCELLED", icon: Ban, description: "Execution has been cancelled", color: "bg-gray-900/30 text-gray-300 border-gray-700" },
  { id: "SKIPPED", label: "SKIPPED", icon: SkipForward, description: "Execution has been skipped", color: "bg-gray-900/30 text-gray-300 border-gray-700" },
  { id: "QUEUED", label: "QUEUED", icon: Clock, description: "Execution is queued for processing", color: "bg-indigo-900/30 text-indigo-300 border-indigo-700" },
  { id: "RETRYING", label: "RETRYING", icon: RefreshCw, description: "Execution is being retried", color: "bg-cyan-900/30 text-cyan-300 border-cyan-700" },
  { id: "RETRIED", label: "RETRIED", icon: RotateCcw, description: "Execution has been retried", color: "bg-cyan-900/30 text-cyan-300 border-cyan-700" },
  { id: "BREAKPOINT", label: "BREAKPOINT", icon: Circle, description: "Execution stopped at breakpoint", color: "bg-pink-900/30 text-pink-300 border-pink-700" },
];

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

  // Execution States state management
  const [synonymDialogOpen, setSynonymDialogOpen] = useState(false);
  const [selectedStateForSynonym, setSelectedStateForSynonym] = useState<string>("");
  const [newSynonymValue, setNewSynonymValue] = useState("");
  const [synonymError, setSynonymError] = useState("");
  const queryClient = useQueryClient();

  // Fetch execution state synonyms
  const { data: executionStateSynonyms = [], isLoading: isLoadingSynonyms } = useQuery<ExecutionStateSynonym[]>({
    queryKey: ["executionStateSynonyms", tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/tenants/${tenantId}/execution-states`);
      if (!response.ok) throw new Error("Failed to fetch execution state synonyms");
      return response.json();
    },
  });

  // Create synonym mutation
  const createSynonymMutation = useMutation({
    mutationFn: async ({ defaultState, synonym }: { defaultState: string; synonym: string }) => {
      const response = await fetch(`/api/tenants/${tenantId}/execution-states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultState, synonym }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create synonym");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executionStateSynonyms", tenantId] });
      setSynonymDialogOpen(false);
      setNewSynonymValue("");
      setSynonymError("");
      toast({ title: "Synonym added", description: "The custom execution state has been created." });
    },
    onError: (error: Error) => {
      setSynonymError(error.message);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete synonym mutation
  const deleteSynonymMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tenants/${tenantId}/execution-states/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete synonym");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executionStateSynonyms", tenantId] });
      toast({ title: "Synonym removed", description: "The custom execution state has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Group synonyms by default state
  const synonymsByState = useMemo(() => {
    const grouped: Record<string, ExecutionStateSynonym[]> = {};
    executionStateSynonyms.forEach((synonym) => {
      if (!grouped[synonym.defaultState]) {
        grouped[synonym.defaultState] = [];
      }
      grouped[synonym.defaultState].push(synonym);
    });
    return grouped;
  }, [executionStateSynonyms]);

  const handleOpenSynonymDialog = (stateId: string) => {
    setSelectedStateForSynonym(stateId);
    setNewSynonymValue("");
    setSynonymError("");
    setSynonymDialogOpen(true);
  };

  const handleSaveSynonym = () => {
    if (!selectedStateForSynonym) {
      setSynonymError("Please select a default state");
      return;
    }
    if (!newSynonymValue.trim()) {
      setSynonymError("Synonym cannot be empty");
      return;
    }
    // Convert to uppercase with underscores (e.g., "Application Submitted" -> "APPLICATION_SUBMITTED")
    const formattedSynonym = newSynonymValue
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
    
    createSynonymMutation.mutate({
      defaultState: selectedStateForSynonym,
      synonym: formattedSynonym,
    });
  };

  const handleDeleteSynonym = (id: string) => {
    deleteSynonymMutation.mutate(id);
  };

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
              {activeTab === "Execution states" ? (
                <Button
                  className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    setSelectedStateForSynonym("");
                    setNewSynonymValue("");
                    setSynonymError("");
                    setSynonymDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New state
                </Button>
              ) : (
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
              )}
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
        ) : activeTab === "Execution states" ? (
          <div className="flex-1 overflow-y-auto p-6 bg-[#1F232D]">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Define custom execution state synonyms that map to the default Kestra execution states. 
                These custom states can be used to track business-specific phases or application states.
              </p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {EXECUTION_STATE_CONFIGS.map((stateConfig) => {
                const StatIcon = stateConfig.icon;
                const stateSynonyms = synonymsByState[stateConfig.id] || [];
                
                return (
                  <Card
                    key={stateConfig.id}
                    className={cn(
                      "border shadow-sm p-3 flex flex-col gap-2.5 bg-[#262A35]",
                      stateConfig.color.includes("green") && "border-green-700/40",
                      stateConfig.color.includes("red") && "border-red-700/40",
                      stateConfig.color.includes("blue") && "border-blue-700/40",
                      stateConfig.color.includes("yellow") && "border-yellow-700/40",
                      stateConfig.color.includes("purple") && "border-purple-700/40",
                      stateConfig.color.includes("teal") && "border-teal-600/40",
                      stateConfig.color.includes("orange") && "border-orange-700/40",
                      stateConfig.color.includes("gray") && "border-gray-700/40",
                      stateConfig.color.includes("indigo") && "border-indigo-700/40",
                      stateConfig.color.includes("cyan") && "border-cyan-700/40",
                      stateConfig.color.includes("pink") && "border-pink-700/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <StatIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-semibold text-foreground">
                        {stateConfig.label}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 min-h-[60px] flex-1">
                      {stateSynonyms.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground/60 italic">
                          No custom synonyms
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {stateSynonyms.map((synonym) => (
                            <Badge
                              key={synonym.id}
                              className={cn(
                                "text-[11px] font-medium px-2 py-0.5 pr-1 flex items-center gap-1 border",
                                stateConfig.color.includes("green") && "bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30",
                                stateConfig.color.includes("red") && "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30",
                                stateConfig.color.includes("blue") && "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30",
                                stateConfig.color.includes("yellow") && "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30",
                                stateConfig.color.includes("purple") && "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30",
                                stateConfig.color.includes("teal") && "bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30",
                                stateConfig.color.includes("orange") && "bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30",
                                stateConfig.color.includes("gray") && "bg-gray-500/20 text-gray-300 border-gray-500/40 hover:bg-gray-500/30",
                                stateConfig.color.includes("indigo") && "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30",
                                stateConfig.color.includes("cyan") && "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30",
                                stateConfig.color.includes("pink") && "bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30",
                              )}
                            >
                              <span>{synonym.synonym}</span>
                              <button
                                onClick={() => handleDeleteSynonym(synonym.id)}
                                className="ml-0.5 hover:text-destructive transition-colors"
                                aria-label="Remove synonym"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSynonymDialog(stateConfig.id)}
                      className="w-full text-[11px] h-7 border-border/70 bg-transparent text-foreground hover:bg-muted/40"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add synonym
                    </Button>
                  </Card>
                );
              })}
            </div>

            <Dialog open={synonymDialogOpen} onOpenChange={setSynonymDialogOpen}>
              <DialogContent className="bg-background border-border text-foreground">
                <DialogHeader>
                  <DialogTitle>Add Custom Synonym</DialogTitle>
                  <DialogDescription>
                    {selectedStateForSynonym ? (
                      <>
                        Create a custom execution state that maps to{" "}
                        <span className="font-semibold text-foreground">{selectedStateForSynonym}</span>.
                        The synonym must be unique across all tenants.
                      </>
                    ) : (
                      <>
                        Select an execution state and create a custom synonym that maps to it.
                        The synonym must be unique across all tenants.
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Default State *</label>
                    {selectedStateForSynonym ? (
                      <Input
                        value={selectedStateForSynonym}
                        disabled
                        className="bg-muted/50"
                      />
                    ) : (
                      <Select
                        value={selectedStateForSynonym}
                        onValueChange={setSelectedStateForSynonym}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground max-h-[300px]">
                          {EXECUTION_STATE_CONFIGS.map((config) => (
                            <SelectItem key={config.id} value={config.id}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Custom Synonym *</label>
                    <Input
                      value={newSynonymValue}
                      onChange={(e) => setNewSynonymValue(e.target.value)}
                      placeholder="e.g., Application Submitted"
                      className="bg-background"
                    />
                    {newSynonymValue.trim() && (
                      <p className="text-xs text-muted-foreground">
                        Will be saved as:{" "}
                        <span className="font-mono text-foreground">
                          {newSynonymValue.trim().toUpperCase().replace(/\s+/g, "_")}
                        </span>
                      </p>
                    )}
                    {synonymError && (
                      <p className="text-xs text-destructive">{synonymError}</p>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setSynonymDialogOpen(false)}
                    className="text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSynonym}
                    disabled={createSynonymMutation.isPending || !selectedStateForSynonym}
                    className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                  >
                    {createSynonymMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
