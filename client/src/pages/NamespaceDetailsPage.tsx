import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { namespaceSecretsSavedFiltersStorage } from "@/utils/namespaceSecretsSavedFiltersStorage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowUpDown,
  CheckCircle2,
  Copy,
  Pencil,
  PencilLine,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldQuestion,
  Star,
  Trash2,
} from "lucide-react";

interface NamespaceDetailsPageProps {
  params?: {
    namespaceId?: string;
  };
}

type SecretType = "Secret" | "Credential";

type SecretColumnId = "key" | "type" | "description" | "tags" | "provider";

interface SecretEntry {
  id: string;
  key: string;
  type: SecretType;
  description?: string;
  tags: string[];
  provider?: string;
}

interface TagDraft {
  key: string;
  value: string;
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
  interval?: {
    preset: "hour" | "day" | "week" | "month" | "year" | "custom";
    label: string;
    value?: string;
  };
  slots?: Array<{ name: string; limit: number; default?: boolean }>;
  createdAt: string;
}

const NAVIGATION_ITEMS = [
  "Overview",
  "Edit",
  "Flows",
  "Executions",
  "Dependencies",
  "Secrets",
  "Limits",
  "Variables",
  "Plugin defaults",
  "KV Store",
  "Files",
  "Revisions",
  "Audit Logs",
];

const OAUTH_PROVIDERS = [
  "GitHub OAuth2 API",
  "Microsoft OAuth2 API",
  "HubSpot OAuth2 API",
  "Notion OAuth2 API",
  "Slack OAuth2 API",
  "YouTube OAuth2 API",
  "LinkedIn OAuth2 API",
  "Zendesk OAuth2 API",
  "Google OAuth2 API",
  "Google Calendar OAuth2 API",
  "Gmail OAuth2 API",
  "Dropbox OAuth2 API",
];

const INITIAL_SECRETS: SecretEntry[] = [
  {
    id: "secret-1",
    key: "AWS_ACCESS_KEY_ID",
    type: "Secret",
    description: "Test description",
    tags: ["cloud:AWS"],
  },
  {
    id: "secret-2",
    key: "AWS_SECRET_ACCESS_KEY",
    type: "Secret",
    tags: ["cloud:AWS"],
  },
  {
    id: "secret-3",
    key: "SLACK_WEBHOOK_URL",
    type: "Credential",
    description: "Slack incoming webhook",
    tags: ["chatops:slack"],
    provider: "Slack OAuth2 API",
  },
];

const DEFAULT_VISIBLE_FILTERS: string[] = [];
const FILTER_OPTIONS: FilterOption[] = [];

const SECRET_COLUMNS: ColumnConfig[] = [
  { id: "key", label: "Key", description: "Unique identifier for the secret", visible: true, order: 1 },
  { id: "type", label: "Type", description: "Secret vs credential", visible: true, order: 2 },
  { id: "description", label: "Description", description: "Optional context for the secret", visible: true, order: 3 },
  { id: "tags", label: "Tags", description: "Key/value labels", visible: true, order: 4 },
  { id: "provider", label: "Provider", description: "Connected OAuth2 provider", visible: false, order: 5 },
];

const LIMIT_COLUMNS: ColumnConfig[] = [
  { id: "type", label: "Type", description: "Concurrency or quota limit", visible: true, order: 1 },
  { id: "behavior", label: "Behavior", description: "What happens when the limit is reached", visible: true, order: 2 },
  { id: "total-limit", label: "Total limit", description: "Maximum executions allowed", visible: true, order: 3 },
  { id: "interval", label: "Interval", description: "Quota interval (if applicable)", visible: true, order: 4 },
  { id: "slots", label: "Slots", description: "Slot allocations for concurrency", visible: true, order: 5 },
];

const LIMIT_TYPE_DESCRIPTIONS: Record<LimitType, string> = {
  Concurrency: 'Control how many executions can run in parallel for this namespace.',
  Quota: 'Control how many executions can run during a specific time window.',
};

const CONCURRENCY_BEHAVIOR_DESCRIPTIONS: Record<LimitBehavior, string> = {
  QUEUE: 'Queue: additional executions wait until concurrency slots are available.',
  CANCEL: 'Cancel: additional executions are cancelled when concurrency slots are exhausted.',
  FAIL: 'Fail: additional executions fail immediately when concurrency slots are exhausted.',
};

const LIMIT_BEHAVIOR_DESCRIPTIONS: Record<LimitBehavior, string> = {
  QUEUE: 'Queue: additional executions wait until capacity becomes available.',
  CANCEL: 'Cancel: additional executions are cancelled when the limit is reached.',
  FAIL: 'Fail: additional executions fail immediately when the limit is reached.',
};

const QUOTA_BEHAVIOR_EXPLANATIONS: Record<LimitBehavior, string> = {
  QUEUE: 'When the quota is reached, new executions wait until the interval resets.',
  FAIL: 'When the quota is reached, new executions fail with a quota exceeded error.',
  CANCEL: 'When the quota is reached, new executions are cancelled due to quota exceeded.',
};

const QUOTA_INTERVAL_OPTIONS = [
  { value: 'hour', label: 'Per hour' },
  { value: 'day', label: 'Per day' },
  { value: 'week', label: 'Per week' },
  { value: 'month', label: 'Per month' },
  { value: 'year', label: 'Per year' },
  { value: 'custom', label: 'Custom (ISO 8601 duration)' },
] as const;

const INITIAL_LIMITS: LimitEntry[] = [
  {
    id: 'limit-1',
    type: 'Concurrency',
    behavior: 'QUEUE',
    totalLimit: 50,
    slots: [
      { name: 'Standard East', limit: 10, default: true },
      { name: 'Standard West', limit: 10 },
      { name: 'Partners', limit: 5 },
      { name: 'Analytics', limit: 10 },
      { name: 'Maintenance', limit: 5 },
      { name: 'Sandbox', limit: 10 },
    ],
    createdAt: '2025-10-21T17:40:00Z',
  },
  {
    id: 'limit-2',
    type: 'Quota',
    behavior: 'FAIL',
    totalLimit: 750,
    interval: {
      preset: 'day',
      label: 'Per day',
    },
    createdAt: '2025-10-15T09:00:00Z',
  },
  {
    id: 'limit-3',
    type: 'Quota',
    behavior: 'QUEUE',
    totalLimit: 1500,
    interval: {
      preset: 'month',
      label: 'Per month',
    },
    createdAt: '2025-10-01T08:30:00Z',
  },
];

export default function NamespaceDetailsPage({ params }: NamespaceDetailsPageProps) {
  const namespaceParam = params?.namespaceId ?? "company";
  const namespaceName = decodeURIComponent(namespaceParam);

  const { toast } = useToast();

  const [activeNav, setActiveNav] = useState<string>("Secrets");
  const [searchValue, setSearchValue] = useState("");
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(SECRET_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const [secrets, setSecrets] = useState<SecretEntry[]>(INITIAL_SECRETS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formType, setFormType] = useState<SecretType>("Secret");
  const [formKey, setFormKey] = useState("");
  const [formSecret, setFormSecret] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [tagsDraft, setTagsDraft] = useState<TagDraft[]>([{ key: "", value: "" }]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isProviderConnected, setIsProviderConnected] = useState(false);
  const [isOauthDialogOpen, setIsOauthDialogOpen] = useState(false);

  const [limits, setLimits] = useState<LimitEntry[]>(INITIAL_LIMITS);
  const [limitColumns, setLimitColumns] = useState<ColumnConfig[]>(LIMIT_COLUMNS.map((column) => ({ ...column })));
  const [limitSearchValue, setLimitSearchValue] = useState("");
  const [limitVisibleFilters, setLimitVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [limitSavedFilters, setLimitSavedFilters] = useState<SavedFilter[]>([]);
  const [limitPeriodicRefresh, setLimitPeriodicRefresh] = useState(true);
  const [limitDrawerOpen, setLimitDrawerOpen] = useState(false);
  const [newLimitType, setNewLimitType] = useState<LimitType>("Concurrency");
  const [newLimitBehavior, setNewLimitBehavior] = useState<LimitBehavior>("QUEUE");
  const [newLimitTotal, setNewLimitTotal] = useState<number>(1);
  const [slotDrafts, setSlotDrafts] = useState<LimitSlotDraft[]>([]);
  const [slotLimitError, setSlotLimitError] = useState<string>("");
  const [limitFormError, setLimitFormError] = useState<string>("");
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [quotaIntervalPreset, setQuotaIntervalPreset] = useState<typeof QUOTA_INTERVAL_OPTIONS[number]["value"]>("day");
  const [quotaCustomInterval, setQuotaCustomInterval] = useState("P1D");

  useEffect(() => {
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  }, []);

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

  const isSecretsTab = activeNav === "Secrets";
  const isLimitsTab = activeNav === "Limits";

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const visibleLimitColumns = useMemo(
    () => limitColumns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [limitColumns],
  );

  const filteredSecrets = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    if (!term) {
      return secrets;
    }

    return secrets.filter((secret) => {
      const haystack = [
        secret.key,
        secret.type,
        secret.description ?? "",
        secret.provider ?? "",
        secret.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [searchValue, secrets]);

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
        intervalSummary,
        slotSummary,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [limitSearchValue, limits]);

  const limitActiveFilters: { id: string; label: string; value: string; operator?: string }[] = [];

  const resetFormState = () => {
    setFormType("Secret");
    setFormKey("");
    setFormSecret("");
    setFormDescription("");
    setTagsDraft([{ key: "", value: "" }]);
    setSelectedProvider("");
    setIsProviderConnected(false);
    setIsOauthDialogOpen(false);
  };

  const resetLimitForm = () => {
    setNewLimitType("Concurrency");
    setNewLimitBehavior("QUEUE");
    setNewLimitTotal(1);
    setSlotDrafts([]);
    setSlotLimitError("");
    setLimitFormError("");
    setQuotaIntervalPreset("day");
    setQuotaCustomInterval("P1D");
  };

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      resetFormState();
    }
  };

  const handleLimitDrawerChange = (open: boolean) => {
    setLimitDrawerOpen(open);
    if (!open) {
      resetLimitForm();
      setEditingLimitId(null);
    }
  };

  const handleAddTagDraft = () => {
    setTagsDraft((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleTagDraftChange = (index: number, field: keyof TagDraft, value: string) => {
    setTagsDraft((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveTagDraft = (index: number) => {
    setTagsDraft((prev) => {
      if (prev.length === 1) {
        return [{ key: "", value: "" }];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleAuthorizeProvider = () => {
    setIsProviderConnected(true);
    setIsOauthDialogOpen(false);
  };

  const handleRemoveProvider = () => {
    setIsProviderConnected(false);
    setSelectedProvider("");
  };

  const handleSelectLimitType = (type: LimitType) => {
    setNewLimitType(type);
    setNewLimitBehavior("QUEUE");
    if (type === "Concurrency") {
      setSlotDrafts([]);
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

  const handleEditLimit = (entry: LimitEntry) => {
    setEditingLimitId(entry.id);
    setNewLimitType(entry.type);
    setNewLimitBehavior(entry.behavior);
    setNewLimitTotal(entry.totalLimit);
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
      const preset = entry.interval?.preset ?? (entry.interval?.value ? "custom" : "day");
      setQuotaIntervalPreset(preset);
      if (preset === "custom") {
        setQuotaCustomInterval(entry.interval?.value ?? "P1D");
      } else {
        setQuotaCustomInterval(entry.interval?.value ?? "P1D");
      }
    }

    setLimitDrawerOpen(true);
  };

  const handleSaveSecret = () => {
    if (!formKey.trim()) {
      return;
    }

    if (formType === "Credential" && (!selectedProvider || !isProviderConnected)) {
      return;
    }

    const formattedTags = tagsDraft
      .map((tag) => (tag.key && tag.value ? `${tag.key}:${tag.value}` : ""))
      .filter(Boolean);

    const newEntry: SecretEntry = {
      id: `namespace-secret-${Date.now()}`,
      key: formKey.trim(),
      type: formType,
      description: formDescription.trim() || undefined,
      tags: formattedTags,
      provider: formType === "Credential" ? selectedProvider : undefined,
    };

    setSecrets((prev) => [newEntry, ...prev]);
    handleDrawerChange(false);
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
        setLimitFormError("Only one concurrency limit can be defined per namespace. Edit the existing concurrency limit instead.");
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

    const targetId = editingLimitId ?? `namespace-limit-${Date.now()}`;
    const existingEntry = editingLimitId ? limits.find((entry) => entry.id === editingLimitId) : undefined;

    const newEntry: LimitEntry = {
      id: targetId,
      type: newLimitType,
      behavior: newLimitBehavior,
      totalLimit: Math.max(1, Math.floor(newLimitTotal)),
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

  const handleDeleteLimit = (id: string) => {
    setLimits((prev) => prev.filter((entry) => entry.id !== id));
  };

  const saveLimitDisabled =
    newLimitTotal < 1 ||
    (newLimitType === "Concurrency" && !!slotLimitError) ||
    (newLimitType === "Quota" && quotaIntervalPreset === "custom" && !quotaCustomInterval.trim()) ||
    !!limitFormError;

  const saveDisabled =
    !formKey.trim() ||
    (formType === "Credential" && (!selectedProvider || !isProviderConnected));

  const activeFilters: { id: string; label: string; value: string; operator?: string }[] = [];

  const handleCopyReference = async (entry: SecretEntry) => {
    const snippet = entry.type === "Secret"
      ? `{{ secret('${entry.key}') }}`
      : `{{ credential('${entry.key}') }}`;

    try {
      await navigator.clipboard.writeText(snippet);
      toast({ title: "Copied", description: `Copied ${entry.type.toLowerCase()} reference for ${entry.key}.` });
    } catch (error) {
      console.error("Failed to copy secret reference", error);
      toast({ title: "Copy failed", description: "We couldn't copy that reference. Try again.", variant: "destructive" });
    }
  };

  const handleClearFilter = (_filterId: string) => {
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setSearchValue("");
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(SECRET_COLUMNS.map((column) => ({ ...column })));
  };

  const handleResetFilterById = (_filterId: string) => {
    handleResetFilters();
  };

  const handleRefreshData = () => {
    console.log(`Refreshing secrets for namespace ${namespaceName}...`);
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
    console.log(`Refreshing limits for namespace ${namespaceName}...`);
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
          <span className="text-sm font-medium text-foreground">
            {entry.behavior}
          </span>
        );
      case "total-limit":
        return <span className="text-sm text-foreground font-semibold">{entry.totalLimit}</span>;
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

  const getCurrentFilterState = (): SavedFilter["filterState"] => ({
    searchValue,
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
    triggerIdOperator: "equals",
    triggerIdValue: "",
    actorValue: "",
    selectedActions: [],
    actionsOperator: "in",
    selectedResources: [],
    resourcesOperator: "in",
    detailsKey: "",
    detailsValue: "",
    visibleFilters,
  });

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

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `namespace-secrets-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    namespaceSecretsSavedFiltersStorage.save(filter);
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    namespaceSecretsSavedFiltersStorage.delete(filterId);
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    namespaceSecretsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  };

  const handleSaveLimitFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `namespace-limits-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
      : [...DEFAULT_VISIBLE_FILTERS];
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

  const renderCell = (entry: SecretEntry, columnId: SecretColumnId) => {
    switch (columnId) {
      case "key":
        return <span className="font-mono text-xs text-primary-foreground/80">{entry.key}</span>;
      case "type":
        return <span className="text-sm text-foreground">{entry.type}</span>;
      case "description":
        return entry.description ? <span className="text-sm text-muted-foreground">{entry.description}</span> : <span className="text-muted-foreground">—</span>;
      case "tags":
        return entry.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={`${entry.id}-${tag}`} variant="secondary" className="border border-border/60 bg-muted/40 px-2 py-1 text-xs text-foreground/90">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "provider":
        return entry.provider ? <span className="text-sm text-foreground">{entry.provider}</span> : <span className="text-muted-foreground">—</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="px-6 py-5 space-y-4 bg-card/60">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/namespaces">Namespaces</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{namespaceName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-foreground">{namespaceName}</span>
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="outline" className="border-border/70 bg-transparent text-foreground hover:bg-muted/40">
                <PencilLine className="h-4 w-4" />
                Edit namespace
              </Button>
              {isSecretsTab ? (
                <>
                  <Button variant="secondary" className="border border-border/60 bg-muted/40 text-foreground hover:bg-muted/60">
                    Inherited secrets
                  </Button>
                  <Sheet open={drawerOpen} onOpenChange={handleDrawerChange}>
                    <SheetTrigger asChild>
                      <Button className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        New secret
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-full border-l border-border bg-background text-foreground sm:max-w-xl"
                    >
                  <SheetHeader>
                    <SheetTitle>New secret</SheetTitle>
                    <SheetDescription>
                      Store a new secret or connect an OAuth2 credential for this namespace.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 rounded-md bg-muted/50 p-1 text-sm font-medium">
                      {(["Secret", "Credential"] as SecretType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setFormType(type);
                            if (type === "Secret") {
                              setSelectedProvider("");
                              setIsProviderConnected(false);
                              setIsOauthDialogOpen(false);
                            }
                          }}
                          className={cn(
                            "rounded-md px-3 py-2 transition-colors",
                            formType === type
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {type === "Secret" ? "Secret" : "Credential"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="namespace-secret-key">Key *</Label>
                        <Input
                          id="namespace-secret-key"
                          value={formKey}
                          onChange={(event) => setFormKey(event.target.value)}
                          placeholder={formType === "Credential" ? "Provide a unique identifier for this credential" : "Provide a unique identifier for this secret"}
                        />
                      </div>

                      {formType === "Secret" ? (
                        <div className="space-y-2">
                          <Label htmlFor="namespace-secret-value">Secret</Label>
                          <Input
                            id="namespace-secret-value"
                            value={formSecret}
                            onChange={(event) => setFormSecret(event.target.value)}
                            placeholder="Enter secret value"
                            type="password"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="namespace-secret-description">Description</Label>
                        <Input
                          id="namespace-secret-description"
                          value={formDescription}
                          onChange={(event) => setFormDescription(event.target.value)}
                          placeholder={`Short description of the ${formType.toLowerCase()}`}
                        />
                      </div>

                      {formType === "Credential" ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select
                              value={selectedProvider}
                              onValueChange={(value) => {
                                setSelectedProvider(value);
                                setIsProviderConnected(false);
                                setIsOauthDialogOpen(false);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a provider" />
                              </SelectTrigger>
                              <SelectContent>
                                {OAUTH_PROVIDERS.map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedProvider && !isProviderConnected ? (
                            <Button
                              type="button"
                              className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                              onClick={() => setIsOauthDialogOpen(true)}
                            >
                              Connect my account
                            </Button>
                          ) : null}

                          {selectedProvider && isProviderConnected ? (
                            <div className="mt-2 flex flex-col gap-3 rounded-md border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                              <div className="flex items-center gap-2 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Account connected ({selectedProvider})
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/10"
                                  onClick={() => setIsOauthDialogOpen(true)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  Reconnect
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-200 hover:bg-emerald-500/10"
                                  onClick={handleRemoveProvider}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete credential
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        <Label>Tags</Label>
                        <div className="flex flex-col gap-3">
                          {tagsDraft.map((tag, index) => (
                            <div key={`tag-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                              <Input
                                value={tag.key}
                                onChange={(event) => handleTagDraftChange(index, "key", event.target.value)}
                                placeholder="Key"
                              />
                              <Input
                                value={tag.value}
                                onChange={(event) => handleTagDraftChange(index, "value", event.target.value)}
                                placeholder="Value"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveTagDraft(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-muted text-foreground hover:bg-muted/80"
                          onClick={handleAddTagDraft}
                        >
                          <Plus className="h-4 w-4" />
                          Add tag
                        </Button>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="mt-8">
                    <div className="flex w-full justify-end gap-3">
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:bg-muted"
                        onClick={() => handleDrawerChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                        onClick={handleSaveSecret}
                        disabled={saveDisabled}
                      >
                        Save
                      </Button>
                    </div>
                  </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </>
              ) : null}
              {isLimitsTab ? (
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
                      <SheetTitle>New limit</SheetTitle>
                      <SheetDescription>
                        Create a concurrency or quota limit for this namespace.
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
                          <Label>Behavior *</Label>
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

                        <div className="space-y-2">
                          <Label htmlFor="limit-total">Total limit *</Label>
                          <Input
                            id="limit-total"
                            type="number"
                            min={1}
                            value={newLimitTotal}
                            onChange={(event) => setNewLimitTotal(Number(event.target.value) || 0)}
                          />
                        </div>

                        {newLimitType === "Concurrency" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Slots</Label>
                              <Button variant="ghost" size="sm" onClick={handleAddSlotDraft} className="text-primary hover:text-primary">
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
                                      <Label htmlFor={`slot-name-${index}`}>Slot name</Label>
                                      <Input
                                        id={`slot-name-${index}`}
                                        value={slot.name}
                                        onChange={(event) => handleSlotDraftChange(index, "name", event.target.value)}
                                        placeholder="e.g. high"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label htmlFor={`slot-limit-${index}`}>Limit</Label>
                                      <Input
                                        id={`slot-limit-${index}`}
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
                                      <Label htmlFor={`slot-default-${index}`} className="text-sm text-muted-foreground">
                                        Default slot
                                      </Label>
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
                            {slotLimitError ? (
                              <p className="text-xs text-destructive">{slotLimitError}</p>
                            ) : null}
                          </div>
                        ) : null}

                        {newLimitType === "Quota" ? (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Interval *</Label>
                              <Select
                                value={quotaIntervalPreset}
                                onValueChange={(value) => setQuotaIntervalPreset(value as typeof QUOTA_INTERVAL_OPTIONS[number]["value"])}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Select interval" />
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
                                <Label htmlFor="quota-custom-interval">Custom interval (ISO 8601 duration)</Label>
                                <Input
                                  id="quota-custom-interval"
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

                    <SheetFooter className="mt-8">
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
              ) : null}
            </div>
          </div>

          <nav className="-mb-2 flex flex-wrap items-center gap-1 text-sm">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveNav(item)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        {isSecretsTab ? (
          <>
            <FilterInterface
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              activeFilters={activeFilters}
              onClearFilter={handleClearFilter}
              onEditFilter={() => {}}
              onResetFilters={handleResetFilters}
              showChart={false}
              onToggleShowChart={() => {}}
              periodicRefresh={periodicRefresh}
              onTogglePeriodicRefresh={setPeriodicRefresh}
              onRefreshData={handleRefreshData}
              columns={columns}
              onColumnsChange={setColumns}
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
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilter}
              onLoadFilter={handleLoadFilter}
              onDeleteFilter={handleDeleteFilter}
              onUpdateFilter={handleUpdateFilter}
              visibleFilters={visibleFilters}
              onVisibleFiltersChange={setVisibleFilters}
              onResetFilter={handleResetFilterById}
              filterOptions={FILTER_OPTIONS}
              searchPlaceholder="Search secrets"
              showChartToggleControl={false}
            />

            <div className="flex-1 overflow-auto px-6 pb-8">
              <div className="mt-4 rounded-lg border border-border/60 bg-card/40 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-muted-foreground">
                        {visibleColumns.map((column) => (
                          <th key={column.id} className="px-4 py-3 text-left font-semibold">
                            {column.id === "key" ? (
                              <span className="inline-flex items-center gap-2 text-sm text-primary/80">
                                {column.label}
                                <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                              </span>
                            ) : (
                              column.label
                            )}
                          </th>
                        ))}
                        <th className="w-[120px] px-4 py-3 text-right font-semibold">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSecrets.length === 0 ? (
                        <tr>
                          <td colSpan={visibleColumns.length + 1} className="px-6 py-10 text-center text-sm text-muted-foreground">
                            No secrets found.
                          </td>
                        </tr>
                      ) : (
                        filteredSecrets.map((entry) => (
                          <tr key={entry.id} className="border-t border-border/50 bg-card/60">
                            {visibleColumns.map((column) => (
                              <td key={column.id} className="px-4 py-3 align-top">
                                {renderCell(entry, column.id as SecretColumnId)}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-muted"
                                  onClick={() => handleCopyReference(entry)}
                                  aria-label="Copy secret reference"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-muted"
                                  aria-label="Edit secret"
                                  onClick={() => {
                                    setFormType(entry.type);
                                    setFormKey(entry.key);
                                    setFormDescription(entry.description ?? "");
                                    setTagsDraft(
                                      entry.tags.length > 0
                                        ? entry.tags.map((tag) => {
                                            const [key = "", value = ""] = tag.split(":");
                                            return { key, value };
                                          })
                                        : [{ key: "", value: "" }],
                                    );
                                    if (entry.type === "Credential" && entry.provider) {
                                      setSelectedProvider(entry.provider);
                                      setIsProviderConnected(true);
                                    } else {
                                      setSelectedProvider("");
                                      setIsProviderConnected(false);
                                    }
                                    setDrawerOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-destructive/20"
                                  aria-label="Delete secret"
                                  onClick={() => setSecrets((prev) => prev.filter((secret) => secret.id !== entry.id))}
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
          </>
        ) : isLimitsTab ? (
          <>
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
              filterOptions={FILTER_OPTIONS}
              searchPlaceholder="Search limits"
              showChartToggleControl={false}
            />

            <div className="flex-1 overflow-auto px-6 pb-8">
              <div className="mt-4 rounded-lg border border-border/60 bg-card/40 shadow-sm">
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
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            Content for this section will be available soon.
          </div>
        )}
      </main>

      <Dialog open={isOauthDialogOpen} onOpenChange={setIsOauthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authorize {selectedProvider}</DialogTitle>
            <DialogDescription>
              Grant access so this credential can be refreshed securely. The simulated prompt mirrors an OAuth2 flow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-md border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Kestra OAuth Broker</p>
                <p className="text-xs text-muted-foreground">requests access to continue with {selectedProvider}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-md border border-border/60 bg-background p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Read workspace details</p>
                  <p className="text-xs text-muted-foreground">Used to confirm account ownership and metadata.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldQuestion className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Manage OAuth refresh tokens</p>
                  <p className="text-xs text-muted-foreground">Lets Kestra rotate tokens automatically when they expire.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsOauthDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAuthorizeProvider} className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90">
              Authorize integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
