import { useEffect, useMemo, useState, type ReactNode } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import type { SavedFilter } from "@/types/savedFilters";
import type { ScopeOption } from "@/components/ScopeFilterEditor";
import type { MultiSelectOption } from "@/components/MultiSelectFilterEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FLOWS } from "@/data/flows";
import { ShieldAlert, Edit2, Trash2 } from "lucide-react";

import {
  getKillSwitchBehaviorLabel,
  getKillSwitchScopeLabel,
  type KillSwitchBehavior,
  type KillSwitchScope,
  type KillSwitchType,
} from "@/types/killSwitch";
import { setKillSwitchBanners } from "@/lib/killSwitchBannerStore";

interface KillSwitchRecord {
  id: string;
  name: string;
  type: KillSwitchType;
  scope: KillSwitchScope;
  targets: string[];
  behavior: KillSwitchBehavior;
  reason?: string;
  status: "enabled" | "disabled";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface KillSwitchTableProps {
  rows: KillSwitchRecord[];
  columns: ColumnConfig[];
  onToggle: (record: KillSwitchRecord, desiredStatus: "enabled" | "disabled") => void;
  onEdit: (record: KillSwitchRecord) => void;
  onDelete: (record: KillSwitchRecord) => void;
}

interface KillSwitchFormState {
  name: string;
  type: KillSwitchType;
  scope: KillSwitchScope;
  selectedTargets: string[];
  behavior: KillSwitchBehavior;
  reason: string;
}

const KILL_SWITCH_STORAGE_KEY = "kestra-instance-kill-switches";

const DEFAULT_KILL_SWITCH_HISTORY: KillSwitchRecord[] = [
  {
    id: "kill-tenant-prod",
    name: "Tenant kill switch",
    type: "KILL",
    scope: "tenant",
    targets: ["prod"],
    behavior: "existing",
    reason: "Immediate shutdown during incident IR-2048",
    status: "enabled",
    createdAt: "2025-09-23T09:12:00.000Z",
    updatedAt: "2025-09-23T09:12:00.000Z",
    createdBy: "incident-response",
  },
  {
    id: "kill-namespace-analytics",
    name: "Analytics cooldown",
    type: "GRACEFULLY_KILL",
    scope: "namespace",
    targets: ["company.analytics"],
    behavior: "existing_and_future",
    reason: "Graceful shutdown after data retention updates",
    status: "disabled",
    createdAt: "2025-08-12T14:00:00.000Z",
    updatedAt: "2025-08-15T11:24:00.000Z",
    createdBy: "sre-team",
  },
];

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const KILL_SWITCH_FILTER_OPTIONS: FilterOption[] = [
  { id: "type", label: "Type", description: "Filter by kill switch type", enabled: false, order: 1 },
  { id: "scope", label: "Scope", description: "Filter by scope", enabled: false, order: 2 },
  { id: "service-type", label: "Behavior", description: "Filter by behavior", enabled: false, order: 3 },
  { id: "status", label: "Status", description: "Filter by current status", enabled: false, order: 4 },
];

const KILL_SWITCH_COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Name", description: "Name of the kill switch", visible: true, order: 1 },
  { id: "type", label: "Type", description: "Kill switch type", visible: true, order: 2 },
  { id: "scope", label: "Scope", description: "Kill switch scope", visible: true, order: 3 },
  { id: "targets", label: "Targets", description: "Targets affected by this kill switch", visible: true, order: 4 },
  { id: "behavior", label: "Behavior", description: "How the kill switch behaves", visible: true, order: 5 },
  { id: "reason", label: "Reason", description: "Documented reason", visible: true, order: 6 },
  { id: "created", label: "Created", description: "Creation timestamp", visible: true, order: 7 },
  { id: "updated", label: "Last updated", description: "Last modification timestamp", visible: true, order: 8 },
  { id: "enabled", label: "Enabled", description: "Toggle kill switch", visible: true, order: 9 },
  { id: "actions", label: "Actions", description: "Edit or delete", visible: true, order: 10 },
];

const KILL_SWITCH_TYPE_OPTIONS: MultiSelectOption[] = [
  { id: "KILL", label: "Kill", description: "Kill all affected executions immediately" },
  { id: "GRACEFULLY_KILL", label: "Gracefully kill", description: "Wait for active tasks before stopping" },
  { id: "IGNORE", label: "Ignore", description: "Flag executions that cannot be killed" },
];

const KILL_SWITCH_BEHAVIOR_OPTIONS: MultiSelectOption[] = [
  { id: "existing", label: "Existing executions" },
  { id: "existing_and_future", label: "Existing + future executions" },
];

const KILL_SWITCH_STATUS_OPTIONS: MultiSelectOption[] = [
  { id: "enabled", label: "Enabled" },
  { id: "disabled", label: "Disabled" },
];

const KILL_SWITCH_SCOPE_OPTIONS: ScopeOption[] = [
  { id: "tenant", label: "Tenant", description: "Target specific tenants" },
  { id: "namespace", label: "Namespace", description: "Target namespaces" },
  { id: "flow", label: "Flow", description: "Target flows" },
  { id: "execution", label: "Execution", description: "Target individual executions" },
];

const TENANT_OPTIONS: ScopeOption[] = [
  { id: "prod", label: "prod", description: "Production tenant" },
  { id: "demo", label: "demo", description: "Demo tenant" },
  { id: "stage", label: "stage", description: "Staging tenant" },
];

const NAMESPACE_OPTIONS: ScopeOption[] = [
  { id: "company", label: "company", description: "Root namespace" },
  { id: "company.analytics", label: "company.analytics", description: "Analytics workloads" },
  { id: "company.team.backend", label: "company.team.backend", description: "Backend services" },
  { id: "company.team.frontend", label: "company.team.frontend", description: "Frontend assets" },
  { id: "company.security", label: "company.security", description: "Security operations" },
  { id: "tutorial", label: "tutorial", description: "Guided examples" },
];

const FLOW_OPTIONS: ScopeOption[] = FLOWS.map((flow) => ({
  id: flow.id,
  label: flow.id,
  description: flow.namespace,
}));

const EXECUTION_OPTIONS: ScopeOption[] = [
  { id: "b2c3d4e5", label: "b2c3d4e5", description: "company.team • user-onboarding" },
  { id: "c3d4e5f6", label: "c3d4e5f6", description: "company.team.backend • payment-processing" },
  { id: "d4e5f6g7", label: "d4e5f6g7", description: "company.team.frontend • notification-service" },
  { id: "e5f6g7h8", label: "e5f6g7h8", description: "company.team.api • content-moderation" },
  { id: "f6g7h8i9", label: "f6g7h8i9", description: "company.team.database • backup-restore" },
  { id: "g7h8i9j0", label: "g7h8i9j0", description: "company.analytics • analytics-report" },
  { id: "h8i9j0k1", label: "h8i9j0k1", description: "company.security • security-scan" },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScopeOptions(scope: KillSwitchScope): ScopeOption[] {
  switch (scope) {
    case "tenant":
      return TENANT_OPTIONS;
    case "namespace":
      return NAMESPACE_OPTIONS;
    case "flow":
      return FLOW_OPTIONS;
    case "execution":
      return EXECUTION_OPTIONS;
    default:
      return [];
  }
}

function renderTargets(record: KillSwitchRecord) {
  if (record.targets.length === 0) {
    return "—";
  }
  return record.targets.join(", ");
}

function createDefaultForm(scope: KillSwitchScope = "tenant"): KillSwitchFormState {
  return {
    name: "",
    type: "KILL",
    scope,
    selectedTargets: [],
    behavior: "existing",
    reason: "",
  };
}

function normalizeColumns(columns: ColumnConfig[]): ColumnConfig[] {
  if (columns.some((column) => column.id === "actions")) {
    return columns;
  }
  return [
    ...columns,
    { id: "actions", label: "Actions", description: "Edit or delete", visible: true, order: columns.length + 1 },
  ];
}

function isSameRecord(a: KillSwitchRecord | null, b: KillSwitchRecord | null): boolean {
  return Boolean(a && b && a.id === b.id);
}

function KillSwitchTable({ rows, columns, onToggle, onEdit, onDelete }: KillSwitchTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[60rem] text-sm">
          <TableHeader>
            <TableRow className="bg-surface/60 text-muted-foreground">
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70 bg-[#2F3341]"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
                {visibleColumns.map((column) => {
                  const cellId = column.id;
                  let content: ReactNode = null;

                  switch (cellId) {
                    case "name":
                      content = <span className="font-medium text-foreground">{row.name}</span>;
                      break;
                    case "type":
                      content = row.type.replace("_", " ");
                      break;
                    case "scope":
                      content = getKillSwitchScopeLabel(row.scope);
                      break;
                    case "targets":
                      content = renderTargets(row);
                      break;
                    case "behavior":
                      content = getKillSwitchBehaviorLabel(row.behavior);
                      break;
                    case "reason":
                      content = row.reason ?? "—";
                      break;
                    case "created":
                      content = formatDateTime(row.createdAt);
                      break;
                    case "updated":
                      content = formatDateTime(row.updatedAt);
                      break;
                    case "enabled":
                      content = (
                        <div className="flex justify-end">
                          <Switch
                            checked={row.status === "enabled"}
                            onCheckedChange={(checked) => onToggle(row, checked ? "enabled" : "disabled")}
                          />
                        </div>
                      );
                      break;
                    case "actions":
                      content = (
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => onEdit(row)}
                                aria-label={`Edit kill switch ${row.name}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(row)}
                                aria-label={`Delete kill switch ${row.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      );
                      break;
                    default:
                      content = "—";
                  }

                  const cellClass = cn(
                    "py-3 px-4 bg-[#262A35] text-sm text-muted-foreground",
                    cellId === "actions" || cellId === "enabled" ? "text-right align-middle" : "align-top",
                  );

                  return (
                    <TableCell key={column.id} className={cellClass}>
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export default function InstanceKillSwitchPage() {
  const [killSwitchHistory, setKillSwitchHistory] = useState<KillSwitchRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(KILL_SWITCH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as KillSwitchRecord[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (error) {
        console.warn("Failed to load kill switch history", error);
      }
    }
    return [...DEFAULT_KILL_SWITCH_HISTORY];
  });

  const [columns, setColumns] = useState<ColumnConfig[]>(() => normalizeColumns(KILL_SWITCH_COLUMNS.map((column) => ({ ...column }))));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const [searchValue, setSearchValue] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);

  const [selectedKillSwitchTypes, setSelectedKillSwitchTypes] = useState<string[]>([]);
  const [killSwitchTypeOperator, setKillSwitchTypeOperator] = useState<"in" | "not-in">("in");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [behaviorOperator, setBehaviorOperator] = useState<"in" | "not-in">("in");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusOperator, setStatusOperator] = useState<"in" | "not-in">("in");

  const [killSwitchDialogOpen, setKillSwitchDialogOpen] = useState(false);
  const [killSwitchTargetSearch, setKillSwitchTargetSearch] = useState("");
  const [pendingToggle, setPendingToggle] = useState<{
    record: KillSwitchRecord;
    desiredStatus: "enabled" | "disabled";
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KillSwitchRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<KillSwitchRecord | null>(null);

  const [killSwitchForm, setKillSwitchForm] = useState<KillSwitchFormState>(createDefaultForm());

  const [killSwitchFormError, setKillSwitchFormError] = useState<string | null>(null);

  const scopeOptions = useMemo(
    () => getScopeOptions(killSwitchForm.scope),
    [killSwitchForm.scope],
  );

  const filteredScopeOptions = useMemo(() => {
    const term = killSwitchTargetSearch.trim().toLowerCase();
    if (!term) {
      return scopeOptions;
    }
    return scopeOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(term) ||
        option.description.toLowerCase().includes(term),
    );
  }, [killSwitchTargetSearch, scopeOptions]);

  const filteredKillSwitches = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return killSwitchHistory.filter((entry) => {
      if (term) {
        const haystack = `${entry.name} ${entry.reason ?? ""} ${renderTargets(entry)} ${entry.createdBy}`.toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      if (selectedKillSwitchTypes.length > 0) {
        const includesType = selectedKillSwitchTypes.includes(entry.type);
        if (killSwitchTypeOperator === "in" && !includesType) {
          return false;
        }
        if (killSwitchTypeOperator === "not-in" && includesType) {
          return false;
        }
      }

      if (selectedScopes.length > 0 && !selectedScopes.includes(entry.scope)) {
        return false;
      }

      if (selectedBehaviors.length > 0) {
        const includesBehavior = selectedBehaviors.includes(entry.behavior);
        if (behaviorOperator === "in" && !includesBehavior) {
          return false;
        }
        if (behaviorOperator === "not-in" && includesBehavior) {
          return false;
        }
      }

      if (selectedStatuses.length > 0) {
        const includesStatus = selectedStatuses.includes(entry.status);
        if (statusOperator === "in" && !includesStatus) {
          return false;
        }
        if (statusOperator === "not-in" && includesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [behaviorOperator, killSwitchHistory, killSwitchTypeOperator, searchValue, selectedBehaviors, selectedKillSwitchTypes, selectedScopes, selectedStatuses, statusOperator]);

  const activeKillSwitches = useMemo(
    () => killSwitchHistory.filter((entry) => entry.status === "enabled"),
    [killSwitchHistory],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(KILL_SWITCH_STORAGE_KEY, JSON.stringify(killSwitchHistory));
    } catch (error) {
      console.warn("Failed to persist kill switch history", error);
    }
  }, [killSwitchHistory]);

  useEffect(() => {
    const activeBanners = activeKillSwitches.map((entry) => ({
      id: entry.id,
      scope: entry.scope,
      targets: entry.targets,
      behavior: entry.behavior,
      reason: entry.reason,
    }));

    setKillSwitchBanners(activeBanners);
  }, [activeKillSwitches]);

  const scopeLabel = getKillSwitchScopeLabel(killSwitchForm.scope).toLowerCase();

  const activeFilters = useMemo(() => {
    const filters: { id: string; label: string; value: string; operator?: string }[] = [];

    if (visibleFilters.includes("type") && selectedKillSwitchTypes.length > 0) {
      filters.push({
        id: "type",
        label: "Type",
        value: selectedKillSwitchTypes.join(", "),
        operator: killSwitchTypeOperator === "not-in" ? "not in" : "in",
      });
    }

    if (visibleFilters.includes("scope") && selectedScopes.length > 0) {
      filters.push({
        id: "scope",
        label: "Scope",
        value: selectedScopes.map((scope) => getKillSwitchScopeLabel(scope as KillSwitchScope)).join(", "),
        operator: "in",
      });
    }

    if (visibleFilters.includes("service-type") && selectedBehaviors.length > 0) {
      filters.push({
        id: "service-type",
        label: "Behavior",
        value: selectedBehaviors
          .map((behavior) => getKillSwitchBehaviorLabel(behavior as KillSwitchBehavior))
          .join(", "),
        operator: behaviorOperator === "not-in" ? "not in" : "in",
      });
    }

    if (visibleFilters.includes("status") && selectedStatuses.length > 0) {
      filters.push({
        id: "status",
        label: "Status",
        value: selectedStatuses.join(", "),
        operator: statusOperator === "not-in" ? "not in" : "in",
      });
    }

    return filters;
  }, [behaviorOperator, killSwitchTypeOperator, selectedBehaviors, selectedKillSwitchTypes, selectedScopes, selectedStatuses, statusOperator, visibleFilters]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "type") {
      setSelectedKillSwitchTypes([]);
      setKillSwitchTypeOperator("in");
    } else if (filterId === "scope") {
      setSelectedScopes([]);
    } else if (filterId === "service-type") {
      setSelectedBehaviors([]);
      setBehaviorOperator("in");
    } else if (filterId === "status") {
      setSelectedStatuses([]);
      setStatusOperator("in");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "type") {
      setSelectedKillSwitchTypes([]);
      setKillSwitchTypeOperator("in");
    } else if (filterId === "scope") {
      setSelectedScopes([]);
    } else if (filterId === "service-type") {
      setSelectedBehaviors([]);
      setBehaviorOperator("in");
    } else if (filterId === "status") {
      setSelectedStatuses([]);
      setStatusOperator("in");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedKillSwitchTypes([]);
    setKillSwitchTypeOperator("in");
    setSelectedScopes([]);
    setSelectedBehaviors([]);
    setBehaviorOperator("in");
    setSelectedStatuses([]);
    setStatusOperator("in");
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(normalizeColumns(KILL_SWITCH_COLUMNS.map((column) => ({ ...column }))));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-kill-switch-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: {
        searchValue,
        selectedStates: [],
        statesOperator: "in",
        selectedInterval: "all-time",
        selectedLabels: [],
        labelsOperator: "has-any-of",
        labelsCustomValue: "",
        selectedNamespaces: [],
        namespaceOperator: "in",
        namespaceCustomValue: "",
        selectedFlows: [],
        selectedScopes,
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
        selectedAnnouncementTypes: selectedKillSwitchTypes,
        announcementTypeOperator: killSwitchTypeOperator,
        selectedServiceTypes: selectedBehaviors,
        serviceTypeOperator: behaviorOperator,
        selectedInvitationStatuses: selectedStatuses,
        invitationStatusOperator: statusOperator,
        columnConfig: columns,
      },
    };

    setSavedFilters((prev) => [filter, ...prev]);
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedKillSwitchTypes(state.selectedAnnouncementTypes ?? []);
    setKillSwitchTypeOperator((state.announcementTypeOperator as "in" | "not-in") || "in");
    setSelectedScopes(state.selectedScopes ?? []);
    setSelectedBehaviors(state.selectedServiceTypes ?? []);
    setBehaviorOperator((state.serviceTypeOperator as "in" | "not-in") || "in");
    setSelectedStatuses(state.selectedInvitationStatuses ?? []);
    setStatusOperator((state.invitationStatusOperator as "in" | "not-in") || "in");
    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;
    setVisibleFilters(restoredVisibleFilters);

    if (state.columnConfig && state.columnConfig.length > 0) {
      setColumns(normalizeColumns(state.columnConfig.map((column) => ({ ...column }))));
    } else {
      setColumns(normalizeColumns(KILL_SWITCH_COLUMNS.map((column) => ({ ...column }))));
    }
  };

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== filterId));
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    setSavedFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId
          ? {
              ...filter,
              name,
              description,
              updatedAt: new Date().toISOString(),
            }
          : filter,
      ),
    );
  };

  const handleSubmitKillSwitch = () => {
    if (!killSwitchForm.name.trim()) {
      setKillSwitchFormError("Provide a name so you can identify this kill switch later.");
      return;
    }

    if (killSwitchForm.selectedTargets.length === 0) {
      setKillSwitchFormError(`Select at least one ${scopeLabel} to target.`);
      return;
    }

    const nowIso = new Date().toISOString();

    if (editingRecord) {
      setKillSwitchHistory((prev) =>
        prev.map((entry) =>
          entry.id === editingRecord.id
            ? {
                ...entry,
                name: killSwitchForm.name.trim() || editingRecord.name,
                type: killSwitchForm.type,
                scope: killSwitchForm.scope,
                targets: [...killSwitchForm.selectedTargets],
                behavior: killSwitchForm.behavior,
                reason: killSwitchForm.reason.trim() || undefined,
                updatedAt: nowIso,
              }
            : entry,
        ),
      );
    } else {
      const record: KillSwitchRecord = {
        id: `kill-${Date.now()}`,
        name: killSwitchForm.name.trim() || `${killSwitchForm.type} kill switch`,
        type: killSwitchForm.type,
        scope: killSwitchForm.scope,
        targets: [...killSwitchForm.selectedTargets],
        behavior: killSwitchForm.behavior,
        reason: killSwitchForm.reason.trim() || undefined,
        status: "enabled",
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: "you",
      };

      setKillSwitchHistory((prev) => [record, ...prev]);
    }

    closeKillSwitchDialog();
  };

  const handleKillSwitchToggle = (record: KillSwitchRecord, desiredStatus: "enabled" | "disabled") => {
    if (desiredStatus === "enabled" && record.status === "disabled") {
      setPendingToggle({ record, desiredStatus });
      return;
    }

    setKillSwitchHistory((prev) =>
      prev.map((entry) =>
        entry.id === record.id
          ? {
              ...entry,
              status: desiredStatus,
              updatedAt: new Date().toISOString(),
            }
          : entry,
      ),
    );
  };

  const confirmPendingToggle = () => {
    if (!pendingToggle) {
      return;
    }

    const { record, desiredStatus } = pendingToggle;
    setKillSwitchHistory((prev) =>
      prev.map((entry) =>
        entry.id === record.id
          ? {
              ...entry,
              status: desiredStatus,
              updatedAt: new Date().toISOString(),
            }
          : entry,
      ),
    );
    setPendingToggle(null);
  };

  const cancelPendingToggle = () => {
    setPendingToggle(null);
  };

  const resetKillSwitchFormState = (scope: KillSwitchScope = "tenant") => {
    setEditingRecord(null);
    setKillSwitchForm(createDefaultForm(scope));
    setKillSwitchTargetSearch("");
    setKillSwitchFormError(null);
  };

  const closeKillSwitchDialog = () => {
    setKillSwitchDialogOpen(false);
    resetKillSwitchFormState();
  };

  const openEditKillSwitch = (record: KillSwitchRecord) => {
    setEditingRecord(record);
    setKillSwitchForm({
      name: record.name,
      type: record.type,
      scope: record.scope,
      selectedTargets: [...record.targets],
      behavior: record.behavior,
      reason: record.reason ?? "",
    });
    setKillSwitchTargetSearch("");
    setKillSwitchFormError(null);
    setKillSwitchDialogOpen(true);
  };

  const openDeleteKillSwitch = (record: KillSwitchRecord) => {
    setPendingDelete(record);
  };

  const confirmDeleteKillSwitch = () => {
    if (!pendingDelete) {
      return;
    }

    setKillSwitchHistory((prev) => prev.filter((entry) => entry.id !== pendingDelete.id));

    if (isSameRecord(editingRecord, pendingDelete)) {
      closeKillSwitchDialog();
    }

    setPendingDelete(null);
  };

  const filteredCount = filteredKillSwitches.length;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-[#262A35]/80">
          <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Instance Administration</span>
              <h1 className="text-xl font-semibold text-foreground">Kill Switch</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                <span>Jump to...</span>
                <span>Ctrl+Cmd+K</span>
              </div>
              <Button
                className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  resetKillSwitchFormState();
                  setKillSwitchDialogOpen(true);
                }}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Kill switch
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <FilterInterface
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
            onEditFilter={() => {}}
            onResetFilters={handleResetFilters}
            showChart={showChart}
            onToggleShowChart={setShowChart}
            periodicRefresh={periodicRefresh}
            onTogglePeriodicRefresh={setPeriodicRefresh}
            onRefreshData={() => {}}
            columns={columns}
            onColumnsChange={(nextColumns) => setColumns(normalizeColumns(nextColumns))}
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
            selectedFlows={[]}
            onFlowsSelectionChange={() => {}}
            selectedScopes={selectedScopes}
            onScopesSelectionChange={setSelectedScopes}
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
            selectedInvitationStatuses={selectedStatuses}
            invitationStatusOperator={statusOperator}
            onInvitationStatusesChange={setSelectedStatuses}
            onInvitationStatusOperatorChange={setStatusOperator}
            invitationStatusOptions={KILL_SWITCH_STATUS_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
            selectedPlugins={[]}
            pluginOperator="in"
            onPluginSelectionChange={() => {}}
            onPluginOperatorChange={() => {}}
            pluginOptions={[]}
            selectedAnnouncementTypes={selectedKillSwitchTypes}
            announcementTypeOperator={killSwitchTypeOperator}
            onAnnouncementTypesChange={setSelectedKillSwitchTypes}
            onAnnouncementTypeOperatorChange={setKillSwitchTypeOperator}
            announcementTypeOptions={KILL_SWITCH_TYPE_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
            selectedServiceTypes={selectedBehaviors}
            serviceTypeOperator={behaviorOperator}
            onServiceTypesSelectionChange={setSelectedBehaviors}
            onServiceTypeOperatorChange={setBehaviorOperator}
            serviceTypeOptions={KILL_SWITCH_BEHAVIOR_OPTIONS}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
            onLoadFilter={handleLoadFilter}
            onDeleteFilter={handleDeleteFilter}
            onUpdateFilter={handleUpdateFilter}
            visibleFilters={visibleFilters}
            onVisibleFiltersChange={setVisibleFilters}
            onResetFilter={handleResetFilter}
            filterOptions={KILL_SWITCH_FILTER_OPTIONS}
            scopeOptions={KILL_SWITCH_SCOPE_OPTIONS}
            searchPlaceholder="Search..."
            showChartToggleControl={false}
            showColumnsControl={true}
            showPeriodicRefreshControl={false}
          />

          <div className="flex-1 overflow-auto p-4 bg-[#1F232D]">
            {filteredCount === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="h-6 w-6 text-muted-foreground/80" />
                <p>No kill switches match the current filters.</p>
                <p className="text-xs text-muted-foreground">Update your filters or create a new kill switch to get started.</p>
              </div>
            ) : (
              <KillSwitchTable
                rows={filteredKillSwitches}
                columns={columns}
                onToggle={handleKillSwitchToggle}
                onEdit={openEditKillSwitch}
                onDelete={openDeleteKillSwitch}
              />
            )}
          </div>
        </main>

        <Dialog
          open={killSwitchDialogOpen}
          onOpenChange={(open) => {
            setKillSwitchDialogOpen(open);
            if (!open) {
              resetKillSwitchFormState();
            }
          }}
        >
          <DialogContent className="max-w-2xl border border-border bg-[#1F232D]">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit kill switch" : "Configure kill switch"}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="kill-switch-name">Name</Label>
                <Input
                  id="kill-switch-name"
                  placeholder="Give this kill switch a name"
                  value={killSwitchForm.name}
                  onChange={(event) => setKillSwitchForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 rounded-md border border-border/70 bg-[#262A35] p-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</span>
                  <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/50 p-1 text-sm font-medium">
                    {(["KILL", "GRACEFULLY_KILL", "IGNORE"] as KillSwitchType[]).map((type) => (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setKillSwitchForm((prev) => ({ ...prev, type }))}
                            className={cn(
                              "rounded-md px-3 py-2 transition-colors",
                              killSwitchForm.type === type
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {type === "KILL" && "Kill"}
                            {type === "GRACEFULLY_KILL" && "Gracefully kill"}
                            {type === "IGNORE" && "Ignore"}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p className="max-w-xs text-xs">
                            {type === "KILL" && "Kill all affected executions immediately"}
                            {type === "GRACEFULLY_KILL" && "Continue task runs in progress, then kill affected executions"}
                            {type === "IGNORE" && "Use it as a last resort for executions that can't be killed"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scope</span>
                  <div className="grid grid-cols-2 gap-1 rounded-md bg-muted/50 p-1 text-sm font-medium sm:grid-cols-4">
                    {(["tenant", "namespace", "flow", "execution"] as KillSwitchScope[]).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => {
                          setKillSwitchForm((prev) => ({ ...prev, scope, selectedTargets: [] }));
                          setKillSwitchTargetSearch("");
                        }}
                        className={cn(
                          "rounded-md px-3 py-2 transition-colors",
                          killSwitchForm.scope === scope
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {getKillSwitchScopeLabel(scope)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select {scopeLabel}(s)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between border-border/70 bg-[#1F232D]"
                      >
                        {killSwitchForm.selectedTargets.length > 0
                          ? `${killSwitchForm.selectedTargets.length} selected`
                          : `Choose ${scopeLabel}(s)`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-[#1F232D] p-0" align="start">
                      <div className="border-b border-border/60 p-3">
                        <Input
                          placeholder={`Search ${scopeLabel}s...`}
                          value={killSwitchTargetSearch}
                          onChange={(event) => setKillSwitchTargetSearch(event.target.value)}
                        />
                      </div>
                      <ScrollArea className="max-h-64">
                        {filteredScopeOptions.length === 0 ? (
                          <div className="p-3 text-xs text-muted-foreground">No matches found.</div>
                        ) : (
                          filteredScopeOptions.map((option) => {
                            const checked = killSwitchForm.selectedTargets.includes(option.id);
                            return (
                              <label
                                key={option.id}
                                className="flex cursor-pointer items-start gap-3 border-b border-border/40 px-3 py-2 last:border-b-0 hover:bg-[#32384A]"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => {
                                    setKillSwitchForm((prev) => ({
                                      ...prev,
                                      selectedTargets: checked
                                        ? prev.selectedTargets.filter((value) => value !== option.id)
                                        : [...prev.selectedTargets, option.id],
                                    }));
                                  }}
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm text-foreground">{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  {killSwitchForm.selectedTargets.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {killSwitchForm.selectedTargets.map((target) => (
                        <span
                          key={target}
                          className="rounded-full border border-border/60 bg-[#1F232D] px-2 py-1 text-xs text-muted-foreground"
                        >
                          {target}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Behavior</Label>
                  <Select
                    value={killSwitchForm.behavior}
                    onValueChange={(value: KillSwitchBehavior) =>
                      setKillSwitchForm((prev) => ({ ...prev, behavior: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F232D]">
                      <SelectItem value="existing">Apply only to existing executions</SelectItem>
                      <SelectItem value="existing_and_future">Apply to existing and future executions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kill-switch-reason">Reason (optional)</Label>
                  <Input
                    id="kill-switch-reason"
                    placeholder="Document the incident or change request"
                    value={killSwitchForm.reason}
                    onChange={(event) => setKillSwitchForm((prev) => ({ ...prev, reason: event.target.value }))}
                  />
                </div>
              </div>

              {killSwitchFormError ? (
                <p className="text-sm text-destructive">{killSwitchFormError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={closeKillSwitchDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmitKillSwitch}>
                {editingRecord ? "Save changes" : "Enable kill switch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={Boolean(pendingToggle)} onOpenChange={(open) => (!open ? cancelPendingToggle() : undefined)}>
          <AlertDialogContent className="border border-border bg-[#1F232D]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingToggle
                  ? `Enable kill switch for ${renderTargets(pendingToggle.record)}`
                  : "Enable kill switch"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to enable Kill Switch for {pendingToggle ? renderTargets(pendingToggle.record) : "this scope"}? This stops the selected executions immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelPendingToggle}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPendingToggle}>Enable</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setPendingDelete(null);
            }
          }}
        >
          <AlertDialogContent className="border border-border bg-[#1F232D]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete kill switch</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete
                  ? `Are you sure you want to delete the kill switch "${pendingDelete.name}"? This action cannot be undone.`
                  : "Are you sure you want to delete this kill switch?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDeleteKillSwitch}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
