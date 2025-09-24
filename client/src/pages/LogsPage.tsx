import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, Info, OctagonAlert, Radio } from "lucide-react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import LogsTable, { type LogRow } from "@/components/LogsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import type { SavedFilter } from "@/types/savedFilters";
import { logsSavedFiltersStorage } from "@/utils/logsSavedFiltersStorage";
import type { FlowOption } from "@/components/FlowFilterEditor";
import type { ScopeOption } from "@/components/ScopeFilterEditor";
import type { StateOption } from "@/components/StateFilterEditor";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const LOG_ROWS: LogRow[] = [
  {
    date: "2025-09-19 14:24:41",
    level: "INFO",
    namespace: "company",
    flow: "data_pipeline",
    taskId: "git",
    scope: "user",
    executionId: "grxMwPhudPeuTZzxVbTun",
    triggerId: "git-clone",
    message: "/luigi.txt",
  },
  {
    date: "2025-09-19 14:24:41",
    level: "INFO",
    namespace: "company",
    flow: "data_pipeline",
    taskId: "git",
    scope: "user",
    executionId: "grxMwPhudPeuTZzxVbTun",
    triggerId: "git-clone",
    message:
      "Dry run is disabled, performing following actions (+ for deletions, - for update or no modification)",
  },
  {
    date: "2025-09-19 14:24:20",
    level: "INFO",
    namespace: "company.team",
    flow: "data_pipeline",
    taskId: "first_task",
    scope: "user",
    executionId: "L5RupkX93dAhse47EpOl",
    triggerId: "manual-start",
    message: "Hello from Kestra",
  },
  {
    date: "2025-09-19 14:24:44",
    level: "INFO",
    namespace: "company",
    flow: "data_pipeline",
    taskId: "git",
    scope: "user",
    executionId: "grxMwPhudPeuTZzxVbTun",
    triggerId: "git-clone",
    message: "Start cloning from `https://github.com/Bent/qa-git-task`",
  },
  {
    date: "2025-09-19 14:24:44",
    level: "DEBUG",
    namespace: "company",
    flow: "data_pipeline",
    taskId: "git",
    scope: "system",
    executionId: "grxMwPhudPeuTZzxVbTun",
    triggerId: "git-clone",
    message: "SSLContext already configured with key: JVM",
  },
  {
    date: "2025-09-19 14:24:40",
    level: "TRACE",
    namespace: "tutorial",
    flow: "microservices_and_apis",
    taskId: "write",
    scope: "system",
    executionId: "4hv0bDG3cSHhCTuot9EcsJ",
    triggerId: "microservices-check",
    message: "IllegalVariableEvaluationException: Unable to find 'inputs' used in expression 'col1,col2'",
  },
  {
    date: "2025-09-19 14:24:40",
    level: "ERROR",
    namespace: "tutorial",
    flow: "microservices_and_apis",
    taskId: "write",
    scope: "system",
    executionId: "4hv0bDG3cSHhCTuot9EcsJ",
    triggerId: "microservices-check",
    message: "Unable to find 'inputs' used in expression 'col1,col2' at line 2",
  },
];

const LOG_LEVEL_OPTIONS: StateOption[] = [
  {
    id: "TRACE",
    label: "TRACE",
    icon: Radio,
    description: "Diagnostic events useful for tracing",
  },
  {
    id: "DEBUG",
    label: "DEBUG",
    icon: Bug,
    description: "Detailed information used for debugging",
  },
  {
    id: "INFO",
    label: "INFO",
    icon: Info,
    description: "General operational messages",
  },
  {
    id: "WARN",
    label: "WARN",
    icon: AlertTriangle,
    description: "Indicators of potential issues",
  },
  {
    id: "ERROR",
    label: "ERROR",
    icon: OctagonAlert,
    description: "Errors that need attention",
  },
];

const LOG_FILTER_OPTIONS: FilterOption[] = [
  { id: "interval", label: "Interval", description: "Filter by log timestamp", enabled: true, order: 1 },
  { id: "levels", label: "Levels", description: "Filter by log severity", enabled: true, order: 2 },
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: true, order: 3 },
  { id: "flow", label: "Flow", description: "Filter by flow name", enabled: true, order: 4 },
  { id: "scope", label: "Scope", description: "Filter by user or system logs", enabled: true, order: 5 },
  { id: "trigger-id", label: "Trigger ID", description: "Filter by trigger identifier", enabled: true, order: 6 },
];

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "date", label: "Date", description: "Timestamp of when the log entry was created", visible: true, order: 1 },
  { id: "level", label: "Level", description: "Log severity level", visible: true, order: 2 },
  { id: "namespace", label: "Namespace", description: "Namespace where the log was generated", visible: true, order: 3 },
  { id: "flow", label: "Flow", description: "Name of the flow associated with the log entry", visible: true, order: 4 },
  { id: "task", label: "Task", description: "Task within the flow that produced the log", visible: true, order: 5 },
  { id: "scope", label: "Scope", description: "Scope classification for the log (user or system)", visible: true, order: 6 },
  { id: "executionId", label: "ExecutionId", description: "Execution identifier that produced this log", visible: true, order: 7 },
  { id: "message", label: "Message", description: "Content of the log entry", visible: true, order: 8 },
];

const DEFAULT_VISIBLE_FILTERS = ["interval", "scope"];

const LOG_SCOPE_OPTIONS: ScopeOption[] = [
  {
    id: "user",
    label: "User Logs",
    description: "Logs generated by user initiated actions",
  },
  {
    id: "system",
    label: "System Logs",
    description: "Logs generated by system tasks",
  },
];

const operatorDisplay: Record<string, string> = {
  in: "in",
  "not-in": "not in",
  contains: "contains",
  "starts-with": "starts with",
  "ends-with": "ends with",
  equals: "equals",
  "not-equals": "not equals",
};

export default function LogsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("last-7-days");
  const [intervalStartDate, setIntervalStartDate] = useState<string | undefined>();
  const [intervalEndDate, setIntervalEndDate] = useState<string | undefined>();
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState("");
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['user']);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [levelsOperator, setLevelsOperator] = useState("in");
  const [triggerIdValue, setTriggerIdValue] = useState("");
  const [triggerIdOperator, setTriggerIdOperator] = useState("equals");
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState("has-any-of");
  const [labelsCustomValue, setLabelsCustomValue] = useState("");
  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);
  const [inputsOperator, setInputsOperator] = useState("has-any-of");
  const [inputsCustomValue, setInputsCustomValue] = useState("");
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);
  const [outputsOperator, setOutputsOperator] = useState("has-any-of");
  const [outputsCustomValue, setOutputsCustomValue] = useState("");
  const [selectedKinds, setSelectedKinds] = useState<string[]>(["default"]);
  const [selectedHierarchy, setSelectedHierarchy] = useState("all");
  const [selectedInitialExecution, setSelectedInitialExecution] = useState("");

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const storedFilters = logsSavedFiltersStorage.getAll();
    setSavedFilters(storedFilters);
  }, []);

  const namespaceOptions = useMemo(
    () => Array.from(new Set(LOG_ROWS.map((row) => row.namespace))).sort(),
    [],
  );

  const flowOptions: FlowOption[] = useMemo(
    () =>
      Array.from(new Set(LOG_ROWS.map((row) => row.flow))).map((flow) => ({
        id: flow,
        label: flow,
        description: flow,
      })),
    [],
  );

  const filteredLogs = useMemo(() => {
    return LOG_ROWS.filter((row) => {
      if (searchValue.trim()) {
        const needle = searchValue.trim().toLowerCase();
        const haystack = `${row.message} ${row.namespace} ${row.flow} ${row.executionId} ${row.triggerId}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }

      if (selectedLevels.length > 0) {
        if (levelsOperator === "in" && !selectedLevels.includes(row.level)) {
          return false;
        }
        if (levelsOperator === "not-in" && selectedLevels.includes(row.level)) {
          return false;
        }
      }

      if (namespaceOperator === "in") {
        if (selectedNamespaces.length > 0 && !selectedNamespaces.includes(row.namespace)) {
          return false;
        }
      } else if (namespaceOperator === "not-in") {
        if (selectedNamespaces.includes(row.namespace)) {
          return false;
        }
      } else if (namespaceOperator === "contains") {
        if (!row.namespace.toLowerCase().includes(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      } else if (namespaceOperator === "starts-with") {
        if (!row.namespace.toLowerCase().startsWith(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      } else if (namespaceOperator === "ends-with") {
        if (!row.namespace.toLowerCase().endsWith(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      }

      if (selectedFlows.length > 0 && !selectedFlows.includes(row.flow)) {
        return false;
      }

      if (selectedScopes.length > 0 && !selectedScopes.includes(row.scope)) {
        return false;
      }

      const triggerIdCandidate = row.triggerId.toLowerCase();
      const trimmedTriggerValue = triggerIdValue.trim().toLowerCase();

      if (trimmedTriggerValue) {
        if (triggerIdOperator === "equals") {
          if (triggerIdCandidate !== trimmedTriggerValue) {
            return false;
          }
        } else if (triggerIdOperator === "not-equals") {
          if (triggerIdCandidate === trimmedTriggerValue) {
            return false;
          }
        } else if (triggerIdOperator === "contains") {
          if (!triggerIdCandidate.includes(trimmedTriggerValue)) {
            return false;
          }
        } else if (triggerIdOperator === "starts-with") {
          if (!triggerIdCandidate.startsWith(trimmedTriggerValue)) {
            return false;
          }
        } else if (triggerIdOperator === "ends-with") {
          if (!triggerIdCandidate.endsWith(trimmedTriggerValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    searchValue,
    selectedLevels,
    levelsOperator,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    selectedScopes,
    triggerIdValue,
    triggerIdOperator,
  ]);

  const intervalDisplayValue = useMemo(() => {
    if (selectedInterval === "custom-range" && intervalStartDate && intervalEndDate) {
      return `${new Date(intervalStartDate).toLocaleDateString()} - ${new Date(intervalEndDate).toLocaleDateString()}`;
    }
    return selectedInterval.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }, [selectedInterval, intervalStartDate, intervalEndDate]);

  const levelsFilterValue = useMemo(() => {
    if (selectedLevels.length === 0) return "Any";
    if (selectedLevels.length === 1) return selectedLevels[0];
    return `${selectedLevels.length} selected`;
  }, [selectedLevels]);

  const namespaceFilterValue = useMemo(() => {
    if (["in", "not-in"].includes(namespaceOperator)) {
      if (selectedNamespaces.length === 0) return "Any";
      if (selectedNamespaces.length === 1) return selectedNamespaces[0];
      return `${selectedNamespaces.length} selected`;
    }

    if (!namespaceCustomValue.trim()) {
      return "Any";
    }

    return namespaceCustomValue;
  }, [namespaceOperator, selectedNamespaces, namespaceCustomValue]);

  const flowFilterValue = useMemo(() => {
    if (selectedFlows.length === 0) return "Any";
    if (selectedFlows.length === 1) return selectedFlows[0];
    return `${selectedFlows.length} selected`;
  }, [selectedFlows]);

  const scopeFilterValue = useMemo(() => {
    if (selectedScopes.length === 0 || selectedScopes.length === LOG_SCOPE_OPTIONS.length) {
      return "Any";
    }
    if (selectedScopes.length === 1) {
      const scope = LOG_SCOPE_OPTIONS.find((option) => option.id === selectedScopes[0]);
      return scope?.label ?? "Any";
    }
    return `${selectedScopes.length} selected`;
  }, [selectedScopes]);

  const triggerIdFilterValue = useMemo(() => {
    if (!triggerIdValue.trim()) {
      return "Any";
    }
    return triggerIdValue.trim();
  }, [triggerIdValue]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("interval")) {
      filters.push({
        id: "interval",
        label: "Interval",
        value: intervalDisplayValue,
      });
    }

    if (visibleFilters.includes("levels")) {
      filters.push({
        id: "levels",
        label: "Levels",
        value: levelsFilterValue,
        operator: operatorDisplay[levelsOperator] ?? levelsOperator,
      });
    }

    if (visibleFilters.includes("namespace")) {
      filters.push({
        id: "namespace",
        label: "Namespace",
        value: namespaceFilterValue,
        operator: operatorDisplay[namespaceOperator] ?? namespaceOperator,
      });
    }

    if (visibleFilters.includes("flow")) {
      filters.push({
        id: "flow",
        label: "Flow",
        value: flowFilterValue,
        operator: "in",
      });
    }

    if (visibleFilters.includes("scope")) {
      filters.push({
        id: "scope",
        label: "Scope",
        value: scopeFilterValue,
        operator: "in",
      });
    }

    if (visibleFilters.includes("trigger-id")) {
      filters.push({
        id: "trigger-id",
        label: "Trigger ID",
        value: triggerIdFilterValue,
        operator: operatorDisplay[triggerIdOperator] ?? triggerIdOperator,
      });
    }

    return filters;
  }, [
    visibleFilters,
    intervalDisplayValue,
    levelsFilterValue,
    levelsOperator,
    namespaceFilterValue,
    namespaceOperator,
    flowFilterValue,
    scopeFilterValue,
    triggerIdFilterValue,
    triggerIdOperator,
  ]);

  const handleClearFilter = (filterId: string) => {
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));

    if (filterId === "interval") {
      setSelectedInterval("last-7-days");
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === "levels") {
      setSelectedLevels([]);
      setLevelsOperator("in");
    } else if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "flow") {
      setSelectedFlows([]);
    } else if (filterId === "scope") {
      setSelectedScopes(['user']);
    } else if (filterId === "trigger-id") {
      setTriggerIdValue("");
      setTriggerIdOperator("equals");
    }
  };

  const handleColumnsChange = (updated: ColumnConfig[]) => {
    setColumns(updated);
  };

  const handleIntervalChange = (interval: string, startDate?: string, endDate?: string) => {
    setSelectedInterval(interval);
    setIntervalStartDate(startDate);
    setIntervalEndDate(endDate);
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedInterval("last-7-days");
    setIntervalStartDate(undefined);
    setIntervalEndDate(undefined);
    setSelectedLevels([]);
    setLevelsOperator("in");
    setSelectedNamespaces([]);
    setNamespaceOperator("in");
    setNamespaceCustomValue("");
    setSelectedFlows([]);
    setSelectedScopes(['user']);
    setTriggerIdValue("");
    setTriggerIdOperator("equals");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "interval") {
      setSelectedInterval("last-7-days");
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === "levels") {
      setSelectedLevels([]);
      setLevelsOperator("in");
    } else if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "flow") {
      setSelectedFlows([]);
    } else if (filterId === "scope") {
      setSelectedScopes(['user']);
    } else if (filterId === "trigger-id") {
      setTriggerIdValue("");
      setTriggerIdOperator("equals");
    }
  };

  const getCurrentFilterState = (): SavedFilter["filterState"] => ({
    searchValue,
    selectedStates: [],
    statesOperator: "in",
    selectedLevels,
    levelsOperator,
    selectedInterval,
    intervalStartDate,
    intervalEndDate,
    selectedLabels,
    labelsOperator,
    labelsCustomValue,
    selectedInputs,
    inputsOperator,
    inputsCustomValue,
    selectedOutputs,
    outputsOperator,
    outputsCustomValue,
    enabledValue: null,
    selectedLocked: null,
    selectedMissingSource: null,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    selectedScopes,
    selectedKinds,
    selectedHierarchy,
    selectedInitialExecution,
    triggerIdOperator,
    triggerIdValue,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const id = `logs-filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const newFilter: SavedFilter = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    logsSavedFiltersStorage.save(newFilter);
    setSavedFilters(logsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;

    setSearchValue(state.searchValue ?? "");
    setSelectedInterval(state.selectedInterval ?? "last-7-days");
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setSelectedLevels(state.selectedLevels ?? []);
    setLevelsOperator(state.levelsOperator ?? "in");
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? "in");
    setNamespaceCustomValue(state.namespaceCustomValue ?? "");
    setSelectedFlows(state.selectedFlows ?? []);
    setSelectedScopes(state.selectedScopes ?? ['user']);
    setTriggerIdValue(state.triggerIdValue ?? "");
    setTriggerIdOperator(state.triggerIdOperator ?? "equals");

    const filtersToKeep = new Set<string>();

    if (state.selectedLevels && state.selectedLevels.length > 0) {
      filtersToKeep.add("levels");
    }
    if ((state.selectedNamespaces && state.selectedNamespaces.length > 0) || (state.namespaceCustomValue ?? "").trim()) {
      filtersToKeep.add("namespace");
    }
    if (state.selectedFlows && state.selectedFlows.length > 0) {
      filtersToKeep.add("flow");
    }
    if (state.selectedScopes && state.selectedScopes.length !== LOG_SCOPE_OPTIONS.length) {
      filtersToKeep.add("scope");
    }
    if ((state.triggerIdValue ?? "").trim()) {
      filtersToKeep.add("trigger-id");
    }

    const filtersArray = Array.from(filtersToKeep);
    setVisibleFilters(Array.from(new Set([...DEFAULT_VISIBLE_FILTERS, ...filtersArray])));
  };

  const handleDeleteFilter = (filterId: string) => {
    logsSavedFiltersStorage.delete(filterId);
    setSavedFilters(logsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    logsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(logsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing logs data...");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Logs</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
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
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedLevels={selectedLevels}
          levelsOperator={levelsOperator}
          onLevelsSelectionChange={setSelectedLevels}
          onLevelsOperatorChange={setLevelsOperator}
          selectedInterval={selectedInterval}
          intervalStartDate={intervalStartDate}
          intervalEndDate={intervalEndDate}
          onIntervalChange={handleIntervalChange}
          selectedLabels={selectedLabels}
          labelsOperator={labelsOperator}
          labelsCustomValue={labelsCustomValue}
          onLabelsSelectionChange={setSelectedLabels}
          onLabelsOperatorChange={setLabelsOperator}
          onLabelsCustomValueChange={setLabelsCustomValue}
          selectedInputs={selectedInputs}
          inputsOperator={inputsOperator}
          inputsCustomValue={inputsCustomValue}
          onInputsSelectionChange={setSelectedInputs}
          onInputsOperatorChange={setInputsOperator}
          onInputsCustomValueChange={setInputsCustomValue}
          selectedOutputs={selectedOutputs}
          outputsOperator={outputsOperator}
          outputsCustomValue={outputsCustomValue}
          onOutputsSelectionChange={setSelectedOutputs}
          onOutputsOperatorChange={setOutputsOperator}
          onOutputsCustomValueChange={setOutputsCustomValue}
          selectedNamespaces={selectedNamespaces}
          namespaceOperator={namespaceOperator}
          namespaceCustomValue={namespaceCustomValue}
          onNamespacesSelectionChange={setSelectedNamespaces}
          onNamespaceOperatorChange={setNamespaceOperator}
          onNamespaceCustomValueChange={setNamespaceCustomValue}
          namespaceOptions={namespaceOptions}
          selectedFlows={selectedFlows}
          onFlowsSelectionChange={setSelectedFlows}
          selectedScopes={selectedScopes}
          onScopesSelectionChange={setSelectedScopes}
          selectedKinds={selectedKinds}
          onKindsSelectionChange={setSelectedKinds}
          selectedHierarchy={selectedHierarchy}
          onHierarchySelectionChange={setSelectedHierarchy}
          selectedInitialExecution={selectedInitialExecution}
          onInitialExecutionSelectionChange={setSelectedInitialExecution}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={LOG_FILTER_OPTIONS}
          flowOptions={flowOptions}
          scopeOptions={LOG_SCOPE_OPTIONS}
          levelsFilterOptions={LOG_LEVEL_OPTIONS}
          triggerIdValue={triggerIdValue}
          triggerIdOperator={triggerIdOperator}
          onTriggerIdValueChange={setTriggerIdValue}
          onTriggerIdOperatorChange={setTriggerIdOperator}
          searchPlaceholder="Search logs..."
        />

        <section className="p-6">
          <LogsTable logs={filteredLogs} columns={columns} />
        </section>
      </main>
    </div>
  );
}
