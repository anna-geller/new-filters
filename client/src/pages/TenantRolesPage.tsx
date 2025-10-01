import { useEffect, useMemo, useState } from "react";
import { Filter, Lock } from "lucide-react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { tenantRolesSavedFiltersStorage } from "@/utils/tenantRolesSavedFiltersStorage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleCard {
  id: string;
  name: string;
  managed: boolean;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_ROLES_FILTER_OPTIONS: FilterOption[] = [
  { id: "user", label: "Name", description: "Filter by role name", enabled: false, order: 1 },
];

const TENANT_ROLES_COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Name", description: "Role name", visible: true, order: 1 },
  { id: "id", label: "Identifier", description: "Role identifier", visible: true, order: 2 },
];

const ROLE_CARDS: RoleCard[] = [
  { name: "Admin", id: "admin_demo", managed: true },
  { name: "Apps users", id: "5uImnXpyW7uJkKhHLNFlaoN", managed: false },
  { name: "Developer", id: "developer_demo", managed: true },
  { name: "Editor", id: "editor_demo", managed: true },
  { name: "Launcher", id: "launcher_demo", managed: true },
  { name: "SCIMProvisioner", id: "scim_provisioner", managed: true },
  { name: "Viewer", id: "viewer_demo", managed: true },
];

const PAGE_SIZE_OPTIONS = ["10", "25", "50"];

export default function TenantRolesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(
    TENANT_ROLES_COLUMNS.map((column) => ({ ...column })),
  );
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  useEffect(() => {
    setSavedFilters(tenantRolesSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("user") && nameValue.trim()) {
      filters.push({
        id: "user",
        label: "Name",
        value: nameValue.trim(),
        operator: "matches",
      });
    }

    return filters;
  }, [nameValue, visibleFilters]);

  const filteredRoles = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const nameTerm = nameValue.trim().toLowerCase();

    return ROLE_CARDS.filter((role) => {
      if (searchTerm) {
        const haystack = `${role.name} ${role.id}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (nameTerm && !role.name.toLowerCase().includes(nameTerm)) {
        return false;
      }

      return true;
    });
  }, [nameValue, searchValue]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "user") {
      setNameValue("");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "user") {
      setNameValue("");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setNameValue("");
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_ROLES_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-roles-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: {
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
        userValue: nameValue,
        selectedSuperadminStatuses: [],
        superadminOperator: "in",
        selectedInvitationStatuses: [],
        invitationStatusOperator: "in",
        selectedPlugins: [],
        pluginOperator: "in",
        selectedAnnouncementTypes: [],
        announcementTypeOperator: "in",
      },
    };

    tenantRolesSavedFiltersStorage.save(filter);
    setSavedFilters(tenantRolesSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setNameValue(state.userValue ?? "");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];

    if ((state.userValue ?? "").trim()) {
      restoredVisibleFilters.push("user");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantRolesSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantRolesSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantRolesSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantRolesSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing tenant roles data...");
  };

  const handleIntervalChange = (_interval: string, _startDate?: string, _endDate?: string) => {
    // Roles page does not expose the interval filter; keep signature for FilterInterface compatibility.
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Roles</h1>
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
          selectedInterval="all-time"
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={handleIntervalChange}
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
          userValue={nameValue}
          onUserChange={setNameValue}
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
          filterOptions={TENANT_ROLES_FILTER_OPTIONS}
          userFilterTitle="Role name"
          userFilterPlaceholder="Search..."
          searchPlaceholder="Search..."
          showChartToggleControl={false}
          showColumnsControl={false}
        />

        <div className="flex-1 overflow-auto p-6 bg-[#1F232D]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="border border-border/60 shadow-sm p-6 flex flex-col gap-6 bg-[#262A35]">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">{role.name}</p>
                    <a href="#" className="font-mono text-sm hover:underline break-all block text-[#A3A4DF]">
                      {role.id}
                    </a>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/80 p-2 text-muted-foreground hover:text-foreground transition"
                    aria-label="View role details"
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
                {role.managed && (
                  <div>
                    <Badge variant="secondary" className="gap-1 text-xs font-medium">
                      <Lock className="h-3 w-3" />
                      Managed role
                    </Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 bg-card/40 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <Select value={pageSize} onValueChange={setPageSize}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span>Total: {filteredRoles.length}</span>
        </div>
      </main>
    </div>
  );
}

