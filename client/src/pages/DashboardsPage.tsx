import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "@/types/savedFilters";
import type { SavedFilter } from "@/types/savedFilters";
import { dashboardsSavedFiltersStorage } from "@/utils/dashboardsSavedFiltersStorage";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DASHBOARD_FILTER_OPTIONS: FilterOption[] = [
  { id: "interval", label: "Interval", description: "Filter by dashboard window", enabled: true, order: 1 },
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: true, order: 2 },
  { id: "labels", label: "Labels", description: "Filter by labels", enabled: true, order: 3 },
  { id: "state", label: "State", description: "Filter by execution state", enabled: true, order: 4 },
];

const DEFAULT_VISIBLE_FILTERS = ["interval"];

const METRIC_CARDS = [
  { title: "Success Ratio", value: "72.54%", subtitle: "vs last 7 days", trend: "+4.1%" },
  { title: "Failed Ratio", value: "27.34%", subtitle: "vs last 7 days", trend: "-2.3%" },
  { title: "Running Ratio", value: "0.12%", subtitle: "Active workflows", trend: "0" },
  { title: "Pending Ratio", value: "0%", subtitle: "Awaiting execution", trend: "0" },
] as const;

const EXECUTION_TREND_DATA = [
  { date: "2025-09-12", success: 420, failed: 32, running: 12, duration: 42 },
  { date: "2025-09-13", success: 185, failed: 14, running: 9, duration: 28 },
  { date: "2025-09-14", success: 212, failed: 18, running: 7, duration: 24 },
  { date: "2025-09-15", success: 198, failed: 26, running: 6, duration: 27 },
  { date: "2025-09-16", success: 176, failed: 21, running: 8, duration: 25 },
  { date: "2025-09-17", success: 205, failed: 19, running: 11, duration: 23 },
  { date: "2025-09-18", success: 192, failed: 17, running: 10, duration: 22 },
  { date: "2025-09-19", success: 189, failed: 15, running: 9, duration: 21 },
];

const EXECUTION_STATUS_BREAKDOWN = [
  { name: "Success", value: 1697, color: "#22c55e" },
  { name: "Failed", value: 436, color: "#ef4444" },
  { name: "Running", value: 24, color: "#3b82f6" },
];

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

export default function DashboardsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statesOperator, setStatesOperator] = useState("in");
  const [selectedInterval, setSelectedInterval] = useState("last-7-days");
  const [intervalStartDate, setIntervalStartDate] = useState<string | undefined>();
  const [intervalEndDate, setIntervalEndDate] = useState<string | undefined>();
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState("has-any-of");
  const [labelsCustomValue, setLabelsCustomValue] = useState("");
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [showChart, setShowChart] = useState(false);
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
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [flowOperator, setFlowOperator] = useState("in");
  const [flowCustomValue, setFlowCustomValue] = useState("");

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(dashboardsSavedFiltersStorage.getAll());
  }, []);

  const namespaceOptions = useMemo(
    () =>
      [
        "company",
        "company.team",
        "company.platform",
        "tutorial",
        "sanitychecks",
      ],
    [],
  );

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

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("interval")) {
      filters.push({
        id: "interval",
        label: "Interval",
        value: intervalDisplayValue,
      });
    }

    if (visibleFilters.includes("state") && selectedStates.length > 0) {
      const operatorLabel = statesOperator === "in" ? "in" : "not in";
      filters.push({
        id: "state",
        label: "State",
        value: selectedStates.length === 1 ? selectedStates[0] : `${selectedStates.length} selected`,
        operator: operatorLabel,
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

    return filters;
  }, [
    visibleFilters,
    intervalDisplayValue,
    selectedStates,
    statesOperator,
    namespaceFilterValue,
    namespaceOperator,
    labelsFilterValue,
    labelsOperator,
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
    } else if (filterId === "state") {
      setSelectedStates([]);
      setStatesOperator("in");
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
    setSelectedStates([]);
    setStatesOperator("in");
    setSelectedInterval("last-7-days");
    setIntervalStartDate(undefined);
    setIntervalEndDate(undefined);
    setSelectedNamespaces([]);
    setNamespaceOperator("in");
    setNamespaceCustomValue("");
    setSelectedLabels([]);
    setLabelsOperator("has-any-of");
    setLabelsCustomValue("");
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
    } else if (filterId === "state") {
      setSelectedStates([]);
      setStatesOperator("in");
    }
  };

  const getCurrentFilterState = (): SavedFilter["filterState"] => ({
    searchValue,
    selectedStates,
    statesOperator,
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
    selectedFlows: [],
    selectedScopes,
    selectedKinds,
    selectedHierarchy,
    selectedInitialExecution,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const id = `dashboard-filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const newFilter: SavedFilter = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    dashboardsSavedFiltersStorage.save(newFilter);
    setSavedFilters(dashboardsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;

    setSearchValue(state.searchValue ?? "");
    setSelectedStates(state.selectedStates ?? []);
    setStatesOperator(state.statesOperator ?? "in");
    setSelectedInterval(state.selectedInterval ?? "last-7-days");
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? "in");
    setNamespaceCustomValue(state.namespaceCustomValue ?? "");
    setSelectedLabels(state.selectedLabels ?? []);
    setLabelsOperator(state.labelsOperator ?? "has-any-of");
    setLabelsCustomValue(state.labelsCustomValue ?? "");

    const filtersToShow = new Set(DEFAULT_VISIBLE_FILTERS);

    if ((state.selectedStates ?? []).length > 0) {
      filtersToShow.add("state");
    }
    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? "").trim()) {
      filtersToShow.add("namespace");
    }
    if ((state.selectedLabels ?? []).length > 0 || (state.labelsCustomValue ?? "").trim()) {
      filtersToShow.add("labels");
    }

    setVisibleFilters(Array.from(filtersToShow));
  };

  const handleDeleteFilter = (filterId: string) => {
    dashboardsSavedFiltersStorage.delete(filterId);
    setSavedFilters(dashboardsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    dashboardsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(dashboardsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing dashboards data...");
  };

  const totalExecutions = useMemo(
    () => EXECUTION_STATUS_BREAKDOWN.reduce((sum, item) => sum + item.value, 0),
    [],
  );

  return (
    <div className="min-h-screen bg-[#1F232D]">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Dashboard</span>
            <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          </div>
          <div className="flex items-center">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover-elevate">
              <Menu className="h-4 w-4" />
              <span>Default Dashboard</span>
            </button>
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
          selectedStates={selectedStates}
          statesOperator={statesOperator}
          onSelectedStatesChange={setSelectedStates}
          onStatesOperatorChange={setStatesOperator}
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
          flowOperator={flowOperator}
          flowCustomValue={flowCustomValue}
          onFlowsSelectionChange={setSelectedFlows}
          onFlowOperatorChange={setFlowOperator}
          onFlowCustomValueChange={setFlowCustomValue}
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
          filterOptions={DASHBOARD_FILTER_OPTIONS}
          searchPlaceholder="Search dashboards..."
          showChartToggleControl={false}
          showColumnsControl={false}
        />

        <section className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {METRIC_CARDS.map((card) => (
              <Card key={card.title} className="p-4 bg-[#262A35]/80 border border-border/60 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
                  </div>
                  <span className="text-xs text-emerald-400">{card.trend}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{card.subtitle}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-6 bg-[#262A35]/80 border border-border/60 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Total Executions</h2>
                  <p className="text-xs text-muted-foreground">Executions duration and count per date</p>
                </div>
              </div>
              <ChartContainer
                config={{
                  success: { label: "Success", color: "#22c55e" },
                  failed: { label: "Failed", color: "#ef4444" },
                  running: { label: "Running", color: "#3b82f6" },
                  duration: { label: "Duration", color: "#8b5cf6" },
                }}
              >
                <BarChart data={EXECUTION_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="executions" orientation="left" stroke="var(--border)" />
                  <YAxis yAxisId="duration" orientation="right" stroke="var(--border)" tickFormatter={(value) => `${value}m`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <ReferenceLine y={0} stroke="var(--border)" yAxisId="executions" />
                  <Bar yAxisId="executions" dataKey="success" stackId="executions" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="executions" dataKey="failed" stackId="executions" fill="var(--color-failed)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="executions" dataKey="running" stackId="executions" fill="var(--color-running)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="duration" type="monotone" dataKey="duration" stroke="var(--color-duration)" strokeWidth={2} dot={false} />
                </BarChart>
              </ChartContainer>
            </Card>

            <Card className="p-6 bg-[#262A35]/80 border border-border/60 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Total Executions</h2>
                  <p className="text-xs text-muted-foreground">Completion distribution</p>
                </div>
              </div>
              <div className="relative">
                <ChartContainer
                  config={{
                    Success: { label: "Success", color: "#22c55e" },
                    Failed: { label: "Failed", color: "#ef4444" },
                    Running: { label: "Running", color: "#3b82f6" },
                  }}
                  className="h-[300px] aspect-auto"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={EXECUTION_STATUS_BREAKDOWN}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                    >
                      {EXECUTION_STATUS_BREAKDOWN.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-3xl font-semibold text-foreground">{totalExecutions}</span>
                  <span className="text-xs text-muted-foreground">executions</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
