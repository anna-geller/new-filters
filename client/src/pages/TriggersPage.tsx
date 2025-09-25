import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import TriggersTable, { type TriggerRow } from "@/components/TriggersTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import type { SavedFilter } from "@/types/savedFilters";
import { triggersSavedFiltersStorage } from "@/utils/triggersSavedFiltersStorage";
import type { FlowOption } from "@/components/FlowFilterEditor";
import type { EnabledOption } from "@/components/EnabledFilterEditor";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const TRIGGER_ROWS: TriggerRow[] = [
  {
    id: "afternoon_schedule",
    flow: "penguin_988725",
    namespace: "company.team",
    lastTriggeredDate: "Thu, Sep 18, 2025 2:00 PM",
    contextUpdatedDate: "Thu, Sep 18, 2025 2:34 PM",
    nextEvaluationDate: "Fri, Sep 19, 2025 2:00 AM",
    details: "🖼️",
    enabled: true,
    labels: ["team:backend", "env:production"],
    locked: "false",
    missingSource: "false",
  },
  {
    id: "afternoon_schedule",
    flow: "aardvark_308870",
    namespace: "company.team",
    lastTriggeredDate: "Thu, Sep 18, 2025 2:55 PM",
    contextUpdatedDate: "Thu, Sep 18, 2025 3:26 PM",
    nextEvaluationDate: "Fri, Sep 19, 2025 2:55 AM",
    details: "🖼️",
    enabled: true,
    labels: ["team:backend", "env:production"],
    locked: "false",
    missingSource: "false",
  },
  {
    id: "daily",
    flow: "hello-world",
    namespace: "sanitychecks.blueprints",
    lastTriggeredDate: "Thu, May 22, 2025 8:00 PM",
    contextUpdatedDate: "",
    nextEvaluationDate: "Fri, May 23, 2025 9:00 AM",
    details: "🖼️",
    enabled: false,
    labels: ["team:frontend", "env:production"],
    locked: "true",
    missingSource: "false",
  },
  {
    id: "daily",
    flow: "microservices-and-apis",
    namespace: "sanitychecks.blueprints",
    lastTriggeredDate: "Thu, May 22, 2025 8:00 PM",
    contextUpdatedDate: "",
    nextEvaluationDate: "Fri, May 23, 2025 9:00 AM",
    details: "🖼️",
    enabled: false,
    labels: ["team:backend", "env:production"],
    locked: "true",
    missingSource: "true",
  },
  {
    id: "daily",
    flow: "porcupine_586521",
    namespace: "company.team",
    lastTriggeredDate: "Wed, May 28, 2025 11:00 AM",
    contextUpdatedDate: "",
    nextEvaluationDate: "",
    details: "🖼️",
    enabled: false,
    labels: ["team:analytics", "env:production"],
    locked: "true",
    missingSource: "true",
  },
  {
    id: "daily",
    flow: "sync_sanitychecks",
    namespace: "sanitychecks",
    lastTriggeredDate: "Thu, Aug 14, 2025 8:00 AM",
    contextUpdatedDate: "Fri, Sep 12, 2025 6:28 PM",
    nextEvaluationDate: "Aug 14, 2025 10:00 AM",
    details: "🖼️",
    enabled: true,
    labels: ["team:backend", "env:production", "priority:critical"],
    locked: "false",
    missingSource: "false",
  },
];

const LOCKED_FILTER_OPTIONS: EnabledOption[] = [
  { id: "true", label: "True" },
  { id: "false", label: "False" },
];

const MISSING_SOURCE_FILTER_OPTIONS: EnabledOption[] = [
  { id: "true", label: "Missing" },
  { id: "false", label: "Present" },
];

const TRIGGERS_FILTER_OPTIONS: FilterOption[] = [
  {
    id: "interval",
    label: "Last triggered date",
    description: "Filter by last triggered timestamp",
    enabled: true,
    order: 1,
  },
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: true, order: 2 },
  { id: "labels", label: "Labels", description: "Filter by labels", enabled: true, order: 3 },
  { id: "flow", label: "Flow", description: "Filter by flow", enabled: true, order: 4 },
  { id: "locked", label: "Locked", description: "Filter by lock state", enabled: true, order: 5 },
  { id: "missing-source", label: "Source", description: "Filter triggers missing source", enabled: true, order: 6 },
];

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "Id", description: "Trigger identifier", visible: true, order: 1 },
  { id: "flow", label: "Flow", description: "Flow associated with the trigger", visible: true, order: 2 },
  { id: "namespace", label: "Namespace", description: "Namespace of the trigger", visible: true, order: 3 },
  { id: "lastTriggeredDate", label: "Last triggered date", description: "When the trigger last executed", visible: true, order: 4 },
  { id: "contextUpdatedDate", label: "Context updated date", description: "Last update of trigger context", visible: false, order: 5 },
  { id: "nextEvaluationDate", label: "Next evaluation date", description: "When the trigger evaluates next", visible: false, order: 6 },
  { id: "details", label: "Details", description: "Trigger definition details", visible: true, order: 7 },
  { id: "backfillExecutions", label: "Backfill", description: "Backfill options", visible: true, order: 8 },
  { id: "enabled", label: "Enabled", description: "Enable/disable trigger", visible: true, order: 9 },
];

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const operatorDisplay: Record<string, string> = {
  in: "in",
  "not-in": "not in",
  contains: "contains",
  "starts-with": "starts with",
  "ends-with": "ends with",
  "has-any-of": "has any of",
  "has-all-of": "has all of",
  "has-none-of": "has none of",
  "does-not-contain": "does not contain",
  "is-set": "is set",
  "is-not-set": "is not set",
};

export default function TriggersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("last-7-days");
  const [intervalStartDate, setIntervalStartDate] = useState<string | undefined>();
  const [intervalEndDate, setIntervalEndDate] = useState<string | undefined>();
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState("has-any-of");
  const [labelsCustomValue, setLabelsCustomValue] = useState("");
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [selectedLocked, setSelectedLocked] = useState<string | null>(null);
  const [selectedMissingSource, setSelectedMissingSource] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);
  const [inputsOperator, setInputsOperator] = useState("has-any-of");
  const [inputsCustomValue, setInputsCustomValue] = useState("");
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);
  const [outputsOperator, setOutputsOperator] = useState("has-any-of");
  const [outputsCustomValue, setOutputsCustomValue] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["user"]);
  const [selectedKinds, setSelectedKinds] = useState<string[]>(["default"]);
  const [selectedHierarchy, setSelectedHierarchy] = useState("all");
  const [selectedInitialExecution, setSelectedInitialExecution] = useState("");

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(triggersSavedFiltersStorage.getAll());
  }, []);

  const namespaceOptions = useMemo(
    () => Array.from(new Set(TRIGGER_ROWS.map((row) => row.namespace))).sort(),
    [],
  );

  const flowOptions: FlowOption[] = useMemo(
    () =>
      Array.from(new Set(TRIGGER_ROWS.map((row) => row.flow))).map((flow) => ({
        id: flow,
        label: flow,
        description: flow,
      })),
    [],
  );

  const filteredTriggers = useMemo(() => {
    return TRIGGER_ROWS.filter((row) => {
      if (searchValue.trim()) {
        const needle = searchValue.trim().toLowerCase();
        const haystack = `${row.id} ${row.flow} ${row.namespace}`.toLowerCase();
        if (!haystack.includes(needle)) {
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

      if (selectedLocked !== null && row.locked !== selectedLocked) {
        return false;
      }

      if (selectedMissingSource !== null && row.missingSource !== selectedMissingSource) {
        return false;
      }

      const labelsLower = row.labels.map((label) => label.toLowerCase());
      const selectedLabelsLower = selectedLabels.map((label) => label.toLowerCase());
      const customValueLower = labelsCustomValue.toLowerCase();

      if (labelsOperator === "has-any-of" && selectedLabelsLower.length > 0) {
        if (!selectedLabelsLower.some((label) => labelsLower.includes(label))) {
          return false;
        }
      } else if (labelsOperator === "has-all-of" && selectedLabelsLower.length > 0) {
        if (!selectedLabelsLower.every((label) => labelsLower.includes(label))) {
          return false;
        }
      } else if (labelsOperator === "has-none-of" && selectedLabelsLower.length > 0) {
        if (selectedLabelsLower.some((label) => labelsLower.includes(label))) {
          return false;
        }
      } else if (labelsOperator === "contains" && labelsCustomValue.trim()) {
        if (!labelsLower.some((label) => label.includes(customValueLower))) {
          return false;
        }
      } else if (labelsOperator === "does-not-contain" && labelsCustomValue.trim()) {
        if (labelsLower.some((label) => label.includes(customValueLower))) {
          return false;
        }
      } else if (labelsOperator === "is-set") {
        if (row.labels.length === 0) {
          return false;
        }
      } else if (labelsOperator === "is-not-set") {
        if (row.labels.length > 0) {
          return false;
        }
      }

      return true;
    });
  }, [
    searchValue,
    namespaceOperator,
    selectedNamespaces,
    namespaceCustomValue,
    selectedFlows,
    selectedLocked,
    selectedMissingSource,
    selectedLabels,
    labelsOperator,
    labelsCustomValue,
  ]);

  const intervalDisplayValue = useMemo(() => {
    if (selectedInterval === "custom-range" && intervalStartDate && intervalEndDate) {
      return `${new Date(intervalStartDate).toLocaleDateString()} - ${new Date(intervalEndDate).toLocaleDateString()}`;
    }
    return selectedInterval.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }, [selectedInterval, intervalStartDate, intervalEndDate]);

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

  const labelsFilterValue = useMemo(() => {
    if (["contains", "does-not-contain"].includes(labelsOperator)) {
      return labelsCustomValue.trim() || "Any";
    }
    if (["is-set", "is-not-set"].includes(labelsOperator)) {
      return labelsOperator === "is-set" ? "Any" : "None";
    }
    if (selectedLabels.length === 0) {
      return "Any";
    }
    if (selectedLabels.length === 1) {
      return selectedLabels[0];
    }
    return `${selectedLabels.length} selected`;
  }, [labelsOperator, labelsCustomValue, selectedLabels]);

  const flowFilterValue = useMemo(() => {
    if (selectedFlows.length === 0) return "Any";
    if (selectedFlows.length === 1) return selectedFlows[0];
    return `${selectedFlows.length} selected`;
  }, [selectedFlows]);

  const lockedFilterValue = useMemo(() => {
    if (selectedLocked === null) return "Any";
    return selectedLocked === "true" ? "True" : "False";
  }, [selectedLocked]);

  const missingSourceFilterValue = useMemo(() => {
    if (selectedMissingSource === null) return "Any";
    return selectedMissingSource === "true" ? "Missing" : "Present";
  }, [selectedMissingSource]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("interval")) {
      filters.push({
        id: "interval",
        label: "Last triggered date",
        value: intervalDisplayValue,
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

    if (visibleFilters.includes("labels")) {
      filters.push({
        id: "labels",
        label: "Labels",
        value: labelsFilterValue,
        operator: operatorDisplay[labelsOperator] ?? labelsOperator,
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

    if (visibleFilters.includes("locked")) {
      filters.push({
        id: "locked",
        label: "Locked",
        value: lockedFilterValue,
        operator: "equals",
      });
    }

    if (visibleFilters.includes("missing-source")) {
      filters.push({
        id: "missing-source",
        label: "Source",
        value: missingSourceFilterValue,
        operator: "equals",
      });
    }

    return filters;
  }, [
    visibleFilters,
    intervalDisplayValue,
    namespaceFilterValue,
    namespaceOperator,
    labelsFilterValue,
    labelsOperator,
    flowFilterValue,
    lockedFilterValue,
    missingSourceFilterValue,
  ]);

  const handleClearFilter = (filterId: string) => {
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));

    if (filterId === "interval") {
      setSelectedInterval("last-7-days");
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "labels") {
      setSelectedLabels([]);
      setLabelsOperator("has-any-of");
      setLabelsCustomValue("");
    } else if (filterId === "flow") {
      setSelectedFlows([]);
    } else if (filterId === "locked") {
      setSelectedLocked(null);
    } else if (filterId === "missing-source") {
      setSelectedMissingSource(null);
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
    setSelectedNamespaces([]);
    setNamespaceOperator("in");
    setNamespaceCustomValue("");
    setSelectedLabels([]);
    setLabelsOperator("has-any-of");
    setLabelsCustomValue("");
    setSelectedFlows([]);
    setSelectedLocked(null);
    setSelectedMissingSource(null);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "interval") {
      setSelectedInterval("last-7-days");
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "labels") {
      setSelectedLabels([]);
      setLabelsOperator("has-any-of");
      setLabelsCustomValue("");
    } else if (filterId === "flow") {
      setSelectedFlows([]);
    } else if (filterId === "locked") {
      setSelectedLocked(null);
    } else if (filterId === "missing-source") {
      setSelectedMissingSource(null);
    }
  };

  const getCurrentFilterState = (): SavedFilter["filterState"] => ({
    searchValue,
    selectedStates: [],
    statesOperator: "in",
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
    selectedLocked,
    selectedMissingSource,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    selectedScopes,
    selectedKinds,
    selectedHierarchy,
    selectedInitialExecution,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const id = `triggers-filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const newFilter: SavedFilter = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    triggersSavedFiltersStorage.save(newFilter);
    setSavedFilters(triggersSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;

    setSearchValue(state.searchValue ?? "");
    setSelectedInterval(state.selectedInterval ?? "last-7-days");
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? "in");
    setNamespaceCustomValue(state.namespaceCustomValue ?? "");
    setSelectedLabels(state.selectedLabels ?? []);
    setLabelsOperator(state.labelsOperator ?? "has-any-of");
    setLabelsCustomValue(state.labelsCustomValue ?? "");
    setSelectedFlows(state.selectedFlows ?? []);
    setSelectedLocked(state.selectedLocked ?? null);
    setSelectedMissingSource(state.selectedMissingSource ?? null);

    const filtersToShow = new Set(DEFAULT_VISIBLE_FILTERS);

    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? "").trim()) {
      filtersToShow.add("namespace");
    }
    if ((state.selectedLabels ?? []).length > 0 || (state.labelsCustomValue ?? "").trim()) {
      filtersToShow.add("labels");
    }
    if ((state.selectedFlows ?? []).length > 0) {
      filtersToShow.add("flow");
    }
    if (state.selectedLocked !== null) {
      filtersToShow.add("locked");
    }
    if (state.selectedMissingSource !== null) {
      filtersToShow.add("missing-source");
    }

    setVisibleFilters(Array.from(filtersToShow));
  };

  const handleDeleteFilter = (filterId: string) => {
    triggersSavedFiltersStorage.delete(filterId);
    setSavedFilters(triggersSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    triggersSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(triggersSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing triggers data...");
  };

  return (
    <div className="min-h-screen bg-[#1F232D]">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Triggers</h1>
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
          showChart={false}
          onToggleShowChart={() => {}}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={setPeriodicRefresh}
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
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
          selectedLocked={selectedLocked}
          onLockedChange={setSelectedLocked}
          selectedMissingSource={selectedMissingSource}
          onMissingSourceChange={setSelectedMissingSource}
          lockedOptions={LOCKED_FILTER_OPTIONS}
          missingSourceOptions={MISSING_SOURCE_FILTER_OPTIONS}
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
          filterOptions={TRIGGERS_FILTER_OPTIONS}
          flowOptions={flowOptions}
          showChartToggleControl={false}
          searchPlaceholder="Search triggers..."
        />

        <section className="p-6">
          <TriggersTable triggers={filteredTriggers} columns={columns} />
        </section>
      </main>
    </div>
  );
}
