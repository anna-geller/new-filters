import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import SecretsTable, { type SecretRow } from "@/components/SecretsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { tenantSecretsSavedFiltersStorage } from "@/utils/tenantSecretsSavedFiltersStorage";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_SECRETS_FILTER_OPTIONS: FilterOption[] = [
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: false, order: 1 },
];

const TENANT_SECRETS_COLUMNS: ColumnConfig[] = [
  { id: "namespace", label: "Namespace", description: "Logical grouping where the secret is stored", visible: true, order: 1 },
  { id: "key", label: "Key", description: "Identifier for the stored secret", visible: true, order: 2 },
  { id: "description", label: "Description", description: "Optional notes providing context", visible: true, order: 3 },
  { id: "tags", label: "Tags", description: "Extra categorization tags", visible: true, order: 4 },
];

const TENANT_SECRET_ROWS: SecretRow[] = [
  {
    namespace: "company",
    key: "AWS_ACCESS_KEY_ID",
    description: "Test description",
    tags: ["cloud:AWS"],
  },
  {
    namespace: "company",
    key: "AWS_SECRET_ACCESS_KEY",
    tags: ["cloud:AWS"],
  },
  {
    namespace: "company",
    key: "SLACK_WEBHOOK_URL",
  },
  {
    namespace: "system",
    key: "KESTRA_API_TOKEN",
  },
];

const NAMESPACE_OPTIONS = Array.from(new Set(TENANT_SECRET_ROWS.map((row) => row.namespace))).sort((a, b) => a.localeCompare(b));

export default function TenantSecretsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState("");
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(TENANT_SECRETS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(tenantSecretsSavedFiltersStorage.getAll());
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

    return filters;
  }, [namespaceCustomValue, namespaceOperator, selectedNamespaces, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const namespaceSet = new Set(selectedNamespaces);
    const trimmedNamespace = namespaceCustomValue.trim().toLowerCase();
    const namespaceOp = namespaceOperator;

    return TENANT_SECRET_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.namespace} ${row.key} ${row.description ?? ""} ${(row.tags ?? []).join(" ")}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      const namespaceLower = row.namespace.toLowerCase();

      if (["in", "not-in"].includes(namespaceOp) && namespaceSet.size > 0) {
        const isIncluded = namespaceSet.has(row.namespace);
        if (namespaceOp === "in" && !isIncluded) {
          return false;
        }
        if (namespaceOp === "not-in" && isIncluded) {
          return false;
        }
      }

      if (["contains", "starts-with", "ends-with"].includes(namespaceOp) && trimmedNamespace) {
        if (namespaceOp === "contains" && !namespaceLower.includes(trimmedNamespace)) {
          return false;
        }
        if (namespaceOp === "starts-with" && !namespaceLower.startsWith(trimmedNamespace)) {
          return false;
        }
        if (namespaceOp === "ends-with" && !namespaceLower.endsWith(trimmedNamespace)) {
          return false;
        }
      }

      return true;
    });
  }, [namespaceCustomValue, namespaceOperator, searchValue, selectedNamespaces]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedNamespaces([]);
    setNamespaceOperator("in");
    setNamespaceCustomValue("");
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_SECRETS_COLUMNS.map((column) => ({ ...column })));
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
  });

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-secrets-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    tenantSecretsSavedFiltersStorage.save(filter);
    setSavedFilters(tenantSecretsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? "in");
    setNamespaceCustomValue(state.namespaceCustomValue ?? "");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];

    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? "").trim()) {
      restoredVisibleFilters.push("namespace");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantSecretsSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantSecretsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantSecretsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantSecretsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing tenant secrets data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Secrets</h1>
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
          selectedNamespaces={selectedNamespaces}
          namespaceOperator={namespaceOperator}
          namespaceCustomValue={namespaceCustomValue}
          onNamespacesSelectionChange={setSelectedNamespaces}
          onNamespaceOperatorChange={setNamespaceOperator}
          onNamespaceCustomValueChange={setNamespaceCustomValue}
          namespaceOptions={NAMESPACE_OPTIONS}
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
          onResetFilter={handleResetFilter}
          filterOptions={TENANT_SECRETS_FILTER_OPTIONS}
          searchPlaceholder="Search..."
          showChartToggleControl={false}
        />

        <div className="flex-1 overflow-auto p-4 bg-[#1F232D]">
          <SecretsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
