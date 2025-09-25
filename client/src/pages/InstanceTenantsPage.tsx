import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import TenantsTable, { type TenantRow } from "@/components/TenantsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { instanceTenantsSavedFiltersStorage } from "@/utils/instanceTenantsSavedFiltersStorage";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_TENANTS_FILTER_OPTIONS: FilterOption[] = [
  { id: "user", label: "Tenant ID", description: "Filter by tenant identifier", enabled: false, order: 1 },
];

const INSTANCE_TENANTS_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "Id", description: "Unique identifier for the tenant", visible: true, order: 1 },
  { id: "name", label: "Name", description: "Display name of the tenant", visible: true, order: 2 },
  { id: "workerGroup", label: "Worker Group", description: "Dedicated worker group key", visible: true, order: 3 },
];

const INSTANCE_TENANT_ROWS: TenantRow[] = [
  {
    id: "demo",
    name: "demo",
  },
  {
    id: "prod",
    name: "Production",
    workerGroup: "prod",
  },
  {
    id: "stage",
    name: "Staging",
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

export default function InstanceTenantsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [tenantIdValue, setTenantIdValue] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_TENANTS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceTenantsSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("user") && tenantIdValue.trim()) {
      filters.push({
        id: "user",
        label: "Tenant ID",
        value: tenantIdValue.trim(),
        operator: "matches",
      });
    }

    return filters;
  }, [tenantIdValue, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const tenantIdTerm = tenantIdValue.trim().toLowerCase();

    return INSTANCE_TENANT_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.id} ${row.name ?? ""} ${row.workerGroup ?? ""}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (tenantIdTerm && !row.id.toLowerCase().includes(tenantIdTerm)) {
        return false;
      }

      return true;
    });
  }, [searchValue, tenantIdValue]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "user") {
      setTenantIdValue("");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "user") {
      setTenantIdValue("");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setTenantIdValue("");
    setShowChart(false);
    setPeriodicRefresh(true);
    setSelectedInterval("all-time");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_TENANTS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-tenants-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        userValue: tenantIdValue,
      },
    };

    instanceTenantsSavedFiltersStorage.save(filter);
    setSavedFilters(instanceTenantsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setTenantIdValue(state.userValue ?? "");
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
    instanceTenantsSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceTenantsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceTenantsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceTenantsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing tenants data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Tenants</h1>
            <span className="text-sm text-muted-foreground">Instance Administration</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
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
          userValue={tenantIdValue}
          onUserChange={setTenantIdValue}
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
          filterOptions={INSTANCE_TENANTS_FILTER_OPTIONS}
          userFilterTitle="Tenant ID"
          userFilterPlaceholder="Search by tenant id..."
          searchPlaceholder="Search tenants..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <TenantsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
