import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import AccessTable, { type AccessRow } from "@/components/AccessTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { tenantAccessSavedFiltersStorage } from "@/utils/tenantAccessSavedFiltersStorage";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_ACCESS_FILTER_OPTIONS: FilterOption[] = [
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: false, order: 1 },
  { id: "binding-type", label: "Type", description: "Filter by access type", enabled: false, order: 2 },
];

const TENANT_ACCESS_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "Id", description: "Unique identifier for the access binding", visible: true, order: 1 },
  { id: "type", label: "Type", description: "Whether the entry is for a group or an individual user", visible: true, order: 2 },
  { id: "members", label: "Members", description: "Associated group or specific user assigned to the role", visible: true, order: 3 },
  { id: "role", label: "Role", description: "Permission level granted", visible: true, order: 4 },
  { id: "namespace", label: "Namespace", description: "Namespace where the role is applied", visible: true, order: 5 },
];

const ACCESS_ROWS: AccessRow[] = [
  { id: "3ccunTor", type: "Group", members: "Teams", role: "Admin", namespace: "" },
  { id: "5h5bkm0L", type: "Group", members: "Teams", role: "Viewer", namespace: "" },
  { id: "5h5SgW0R", type: "Group", members: "System", role: "Admin", namespace: "system" },
  { id: "fVtGqbgw", type: "Group", members: "System", role: "Admin", namespace: "kestra" },
  { id: "4ER1lwaV", type: "Group", members: "Data", role: "Admin", namespace: "kestra.data" },
  { id: "7gU0Xfdn", type: "User", members: "Will RUSSELL", role: "Admin", namespace: "" },
  { id: "5eiU4ND8", type: "User", members: "terraform-data", role: "Admin", namespace: "" },
  { id: "7I5Wzyb1", type: "User", members: "terraform-infra", role: "Admin", namespace: "" },
  { id: "7G94Mn7K", type: "User", members: "Ludovic DEHON", role: "Admin", namespace: "" },
  { id: "7XRAVhwn", type: "User", members: "Anna GELLER", role: "Admin", namespace: "" },
  { id: "8hlxYrPq", type: "User", members: "self-sa", role: "Admin", namespace: "kestra" },
];

const BINDING_TYPE_OPTIONS = [
  { id: "group", label: "Groups", description: "Access entries assigned to groups" },
  { id: "user", label: "Users", description: "Access entries assigned to individual users" },
];

const ACCESS_NAMESPACE_OPTIONS = Array.from(
  new Set(
    ACCESS_ROWS
      .map((row) => row.namespace)
      .filter((namespace): namespace is string => namespace !== undefined && namespace.trim().length > 0),
  ),
).sort((a, b) => a.localeCompare(b));

export default function TenantAccessPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState("");
  const [selectedBindingTypes, setSelectedBindingTypes] = useState<string[]>([]);
  const [showChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(TENANT_ACCESS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(tenantAccessSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    const trimmedNamespace = namespaceCustomValue.trim();
    const usesSelectionOperator = ["in", "not-in"].includes(namespaceOperator);
    const usesTextOperator = ["contains", "starts-with", "ends-with"].includes(namespaceOperator);
    const hasNamespaceSelection = selectedNamespaces.length > 0;
    const hasNamespaceText = trimmedNamespace.length > 0;

    if (visibleFilters.includes("namespace") && (hasNamespaceSelection || hasNamespaceText)) {
      const operatorLabels: Record<string, string> = {
        "in": "in",
        "not-in": "not in",
        "contains": "contains",
        "starts-with": "starts with",
        "ends-with": "ends with",
      };

      let value = "";
      if (usesSelectionOperator && hasNamespaceSelection) {
        value = selectedNamespaces.length === 1 ? selectedNamespaces[0] : `${selectedNamespaces.length} selected`;
      } else if (usesTextOperator && hasNamespaceText) {
        value = `"${trimmedNamespace}"`;
      }

      filters.push({
        id: "namespace",
        label: "Namespace",
        value,
        operator: operatorLabels[namespaceOperator] ?? namespaceOperator,
      });
    }

    if (visibleFilters.includes("binding-type") && selectedBindingTypes.length > 0) {
      const labelMap: Record<string, string> = {
        group: "Group",
        user: "User",
      };
      const value = selectedBindingTypes
        .map((type) => labelMap[type] ?? type)
        .join(", ");

      filters.push({
        id: "binding-type",
        label: "Type",
        value,
        operator: "in",
      });
    }

    return filters;
  }, [namespaceCustomValue, namespaceOperator, selectedBindingTypes, selectedNamespaces, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const namespaceSet = new Set(selectedNamespaces);
    const trimmedNamespace = namespaceCustomValue.trim().toLowerCase();
    const textOperator = namespaceOperator;
    const typeSet = new Set(selectedBindingTypes.map((type) => type.toLowerCase()));

    return ACCESS_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.id} ${row.type} ${row.members} ${row.role} ${row.namespace}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      const namespaceValue = row.namespace ?? "";
      const namespaceLower = namespaceValue.toLowerCase();

      if (["in", "not-in"].includes(textOperator) && namespaceSet.size > 0) {
        const isIncluded = namespaceSet.has(namespaceValue);
        if (textOperator === "in" && !isIncluded) {
          return false;
        }
        if (textOperator === "not-in" && isIncluded) {
          return false;
        }
      }

      if (["contains", "starts-with", "ends-with"].includes(textOperator) && trimmedNamespace) {
        if (textOperator === "contains" && !namespaceLower.includes(trimmedNamespace)) {
          return false;
        }
        if (textOperator === "starts-with" && !namespaceLower.startsWith(trimmedNamespace)) {
          return false;
        }
        if (textOperator === "ends-with" && !namespaceLower.endsWith(trimmedNamespace)) {
          return false;
        }
      }

      if (typeSet.size > 0 && !typeSet.has(row.type.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [namespaceCustomValue, namespaceOperator, searchValue, selectedBindingTypes, selectedNamespaces]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "binding-type") {
      setSelectedBindingTypes([]);
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "binding-type") {
      setSelectedBindingTypes([]);
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedNamespaces([]);
    setNamespaceOperator("in");
    setNamespaceCustomValue("");
    setSelectedBindingTypes([]);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_ACCESS_COLUMNS.map((column) => ({ ...column })));
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
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
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
    selectedBindingTypes,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-access-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    tenantAccessSavedFiltersStorage.save(filter);
    setSavedFilters(tenantAccessSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? "in");
    setNamespaceCustomValue(state.namespaceCustomValue ?? "");
    setSelectedBindingTypes(state.selectedBindingTypes ?? []);

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];

    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? "").trim()) {
      restoredVisibleFilters.push("namespace");
    }

    if ((state.selectedBindingTypes ?? []).length > 0) {
      restoredVisibleFilters.push("binding-type");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantAccessSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantAccessSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantAccessSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantAccessSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing tenant access data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Access</h1>
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
          selectedNamespaces={selectedNamespaces}
          namespaceOperator={namespaceOperator}
          namespaceCustomValue={namespaceCustomValue}
          onNamespacesSelectionChange={setSelectedNamespaces}
          onNamespaceOperatorChange={setNamespaceOperator}
          onNamespaceCustomValueChange={setNamespaceCustomValue}
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
          selectedBindingTypes={selectedBindingTypes}
          onBindingTypesChange={setSelectedBindingTypes}
          bindingTypeOptions={BINDING_TYPE_OPTIONS}
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
          onResetFilter={handleResetFilter}
          filterOptions={TENANT_ACCESS_FILTER_OPTIONS}
          namespaceOptions={ACCESS_NAMESPACE_OPTIONS}
          searchPlaceholder="Search..."
          showChartToggleControl={false}
        />

        <div className="flex-1 overflow-auto p-4 bg-[#1F232D]">
          <AccessTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
