import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import WorkerGroupsTable, { type WorkerGroupRow } from "@/components/WorkerGroupsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { instanceWorkerGroupsSavedFiltersStorage } from "@/utils/instanceWorkerGroupsSavedFiltersStorage";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_WORKER_GROUPS_FILTER_OPTIONS: FilterOption[] = [
  { id: "user", label: "Key", description: "Filter by worker group key", enabled: false, order: 1 },
];

const INSTANCE_WORKER_GROUPS_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "Id", description: "Unique identifier for the worker group", visible: true, order: 1 },
  { id: "key", label: "Key", description: "Worker group key", visible: true, order: 2 },
  { id: "state", label: "State", description: "Current state of workers", visible: true, order: 3 },
  { id: "description", label: "Description", description: "Purpose of the worker group", visible: true, order: 4 },
];

const INSTANCE_WORKER_GROUP_ROWS: WorkerGroupRow[] = [
  {
    id: "2apsLTtK",
    key: "Base",
    state: "🔴 0 active workers",
    description: "Base worker group for mixed workloads",
  },
  {
    id: "1ofuldKN",
    key: "GPU",
    state: "🔴 0 active workers",
    description: "Worker group to run GPU-based workflows",
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

export default function InstanceWorkerGroupsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_WORKER_GROUPS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceWorkerGroupsSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("user") && keyValue.trim()) {
      filters.push({
        id: "user",
        label: "Key",
        value: keyValue.trim(),
        operator: "matches",
      });
    }

    return filters;
  }, [keyValue, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const keyTerm = keyValue.trim().toLowerCase();

    return INSTANCE_WORKER_GROUP_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.id} ${row.key} ${row.state} ${row.description}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (keyTerm && !row.key.toLowerCase().includes(keyTerm)) {
        return false;
      }

      return true;
    });
  }, [keyValue, searchValue]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "user") {
      setKeyValue("");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "user") {
      setKeyValue("");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setKeyValue("");
    setShowChart(false);
    setPeriodicRefresh(true);
    setSelectedInterval("all-time");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_WORKER_GROUPS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-worker-groups-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: {
        searchValue,
        selectedStates: [],
        statesOperator: "in",
        selectedInterval,
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
        userValue: keyValue,
      },
    };

    instanceWorkerGroupsSavedFiltersStorage.save(filter);
    setSavedFilters(instanceWorkerGroupsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setKeyValue(state.userValue ?? "");
    setSelectedInterval(state.selectedInterval ?? "all-time");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    if ((state.userValue ?? "").trim()) {
      restoredVisibleFilters.push("user");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceWorkerGroupsSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceWorkerGroupsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceWorkerGroupsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceWorkerGroupsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing worker groups data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Instance Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Worker Groups</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover-elevate">
              Create
            </button>
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
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={setColumns}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedInterval={selectedInterval}
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={(interval) => setSelectedInterval(interval)}
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
          detailsKey=""
          detailsValue=""
          onDetailsChange={() => {}}
          userValue={keyValue}
          onUserChange={setKeyValue}
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
          onResetFilter={handleResetFilter}
          filterOptions={INSTANCE_WORKER_GROUPS_FILTER_OPTIONS}
          userFilterTitle="Key"
          userFilterPlaceholder="Search by key..."
          searchPlaceholder="Search worker groups..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4 bg-[#1F232D]">
          <WorkerGroupsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
