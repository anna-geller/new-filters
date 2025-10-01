import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { tenantGroupsSavedFiltersStorage } from "@/utils/tenantGroupsSavedFiltersStorage";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupCard {
  id: string;
  name: string;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_GROUPS_FILTER_OPTIONS: FilterOption[] = [
  { id: "user", label: "Name", description: "Filter by group name", enabled: false, order: 1 },
];

const TENANT_GROUPS_COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Name", description: "Group name", visible: true, order: 1 },
  { id: "id", label: "Identifier", description: "Group identifier", visible: true, order: 2 },
];

const GROUP_CARDS: GroupCard[] = [
  { name: "Data", id: "5EkkSBod2Yy6DtMNGcHjBd" },
  { name: "Products", id: "6WeYElBGgS3smiRcDF0wFQ" },
  { name: "System", id: "2ydgmmsRRt5zuLVUmvVHcm" },
  { name: "Teams", id: "1rQVg86fm2qxOClr2MIjqG" },
];

const PAGE_SIZE_OPTIONS = ["10", "25", "50"];

export default function TenantGroupsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(
    TENANT_GROUPS_COLUMNS.map((column) => ({ ...column })),
  );
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => {
    setSavedFilters(tenantGroupsSavedFiltersStorage.getAll());
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

  const filteredGroups = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const nameTerm = nameValue.trim().toLowerCase();

    return GROUP_CARDS.filter((group) => {
      if (searchTerm) {
        const haystack = `${group.name} ${group.id}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (nameTerm && !group.name.toLowerCase().includes(nameTerm)) {
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
    setColumns(TENANT_GROUPS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-groups-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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

    tenantGroupsSavedFiltersStorage.save(filter);
    setSavedFilters(tenantGroupsSavedFiltersStorage.getAll());
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
    tenantGroupsSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantGroupsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantGroupsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantGroupsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing tenant groups data...");
  };

  const handleIntervalChange = (_interval: string, _startDate?: string, _endDate?: string) => {
    // Groups page does not expose interval filtering; this satisfies FilterInterface signature.
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Groups</h1>
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
          filterOptions={TENANT_GROUPS_FILTER_OPTIONS}
          userFilterTitle="Group name"
          userFilterPlaceholder="Search..."
          searchPlaceholder="Search..."
          showChartToggleControl={false}
          showColumnsControl={false}
        />

        <div className="flex-1 overflow-auto p-6 bg-[#1F232D]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="border border-border/60 shadow-sm p-6 flex flex-col gap-6 bg-[#262A35]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{group.name}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/80 p-2 text-muted-foreground hover:text-foreground transition"
                    aria-label="View group details"
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <a href="#" className="font-mono text-sm hover:underline break-all text-[#BBF]">
                    {group.id}
                  </a>
                </div>
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
          <span>Total: {filteredGroups.length}</span>
        </div>
      </main>
    </div>
  );
}
