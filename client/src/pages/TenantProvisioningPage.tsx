import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import ProvisioningTable, { type ProvisioningRow } from "@/components/ProvisioningTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { tenantProvisioningSavedFiltersStorage } from "@/utils/tenantProvisioningSavedFiltersStorage";
import type { EnabledOption } from "@/components/EnabledFilterEditor";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_PROVISIONING_FILTER_OPTIONS: FilterOption[] = [
  { id: "enabled", label: "Enabled", description: "Filter by integration state", enabled: false, order: 1 },
];

const TENANT_PROVISIONING_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "Id", description: "Unique identifier for the integration", visible: true, order: 1 },
  { id: "name", label: "Name", description: "Display name of the integration", visible: true, order: 2 },
  { id: "type", label: "Type", description: "Integration protocol type", visible: true, order: 3 },
  { id: "description", label: "Description", description: "Additional integration details", visible: true, order: 4 },
  { id: "state", label: "State", description: "Whether the integration is enabled", visible: true, order: 5 },
];

const TENANT_PROVISIONING_ROWS: ProvisioningRow[] = [
  {
    id: "3Hq6J7a1",
    name: "scim",
    type: "SCIM",
    description: "Azure Directory Sync",
    enabled: true,
  },
  {
    id: "3Hq6J7a2",
    name: "scim2",
    type: "SCIM",
    description: "authentik Directory Sync",
    enabled: false,
  },
];

const ENABLED_FILTER_OPTIONS: EnabledOption[] = [
  { id: "true", label: "Enabled" },
  { id: "false", label: "Disabled" },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const ENABLED_LABEL_MAP: Record<string, string> = {
  true: "True",
  false: "False",
};

export default function TenantProvisioningPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedEnabled, setSelectedEnabled] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [columns, setColumns] = useState<ColumnConfig[]>(TENANT_PROVISIONING_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(tenantProvisioningSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("enabled")) {
      const valueLabel = selectedEnabled === null
        ? "Any"
        : ENABLED_LABEL_MAP[selectedEnabled as "true" | "false"];
      filters.push({
        id: "enabled",
        label: "Enabled",
        value: valueLabel,
        operator: "is",
      });
    }

    return filters;
  }, [selectedEnabled, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();

    return TENANT_PROVISIONING_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.id} ${row.name} ${row.type} ${row.description}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (selectedEnabled !== null) {
        const matchesEnabled = row.enabled === (selectedEnabled === "true");
        if (!matchesEnabled) {
          return false;
        }
      }

      return true;
    });
  }, [searchValue, selectedEnabled]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "enabled") {
      setSelectedEnabled(null);
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "enabled") {
      setSelectedEnabled(null);
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedEnabled(null);
    setShowChart(false);
    setPeriodicRefresh(true);
    setSelectedInterval("all-time");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_PROVISIONING_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-provisioning-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        enabledValue: selectedEnabled,
      },
    };

    tenantProvisioningSavedFiltersStorage.save(filter);
    setSavedFilters(tenantProvisioningSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedEnabled((state.enabledValue as string | null | undefined) ?? null);
    setSelectedInterval(state.selectedInterval ?? "all-time");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    if ((state.enabledValue ?? null) !== null) {
      restoredVisibleFilters.push("enabled");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantProvisioningSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantProvisioningSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantProvisioningSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantProvisioningSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing provisioning integrations data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">SCIM Provisioning</h1>
            <span className="text-sm text-muted-foreground">Tenant Administration</span>
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
          selectedEnabled={selectedEnabled}
          onEnabledChange={setSelectedEnabled}
          enabledOptions={ENABLED_FILTER_OPTIONS}
          enabledFilterHideStatusText
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={TENANT_PROVISIONING_FILTER_OPTIONS}
          searchPlaceholder="Search integrations..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <ProvisioningTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
