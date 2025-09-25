import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import AnnouncementsTable, { type AnnouncementRow } from "@/components/AnnouncementsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { instanceAnnouncementsSavedFiltersStorage } from "@/utils/instanceAnnouncementsSavedFiltersStorage";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_ANNOUNCEMENTS_FILTER_OPTIONS: FilterOption[] = [
  { id: "type", label: "Type", description: "Filter by announcement type", enabled: false, order: 1 },
];

const INSTANCE_ANNOUNCEMENTS_COLUMNS: ColumnConfig[] = [
  { id: "message", label: "Message", description: "Announcement content", visible: true, order: 1 },
  { id: "type", label: "Type", description: "Announcement classification", visible: true, order: 2 },
  { id: "startDate", label: "Start date", description: "Activation date", visible: true, order: 3 },
  { id: "endDate", label: "End date", description: "Expiration date", visible: true, order: 4 },
  { id: "active", label: "Active", description: "Whether announcement is active", visible: true, order: 5 },
];

const INSTANCE_ANNOUNCEMENTS_ROWS: AnnouncementRow[] = [
  {
    message: "test",
    type: "INFO",
    startDate: "Fri, Sep 12, 2025 12:00 AM",
    endDate: "Sat, Sep 13, 2025 12:00 AM",
    active: true,
  },
  {
    message: "Planned maintenance this Sunday",
    type: "WARNING",
    startDate: "Thu, Sep 25, 2025 12:00 AM",
    endDate: "Sun, Sep 28, 2025 11:59 PM",
    active: true,
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: "INFO", label: "INFO" },
  { value: "WARNING", label: "WARNING" },
  { value: "ERROR", label: "ERROR" },
];

export default function InstanceAnnouncementsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedAnnouncementTypes, setSelectedAnnouncementTypes] = useState<string[]>([]);
  const [announcementTypeOperator, setAnnouncementTypeOperator] = useState<"in" | "not-in">("in");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_ANNOUNCEMENTS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceAnnouncementsSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("type") && selectedAnnouncementTypes.length > 0) {
      filters.push({
        id: "type",
        label: "Type",
        value: selectedAnnouncementTypes.join(", "),
        operator: announcementTypeOperator === "not-in" ? "not in" : "in",
      });
    }

    return filters;
  }, [announcementTypeOperator, selectedAnnouncementTypes, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();

    return INSTANCE_ANNOUNCEMENTS_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.message} ${row.type} ${row.startDate} ${row.endDate}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (selectedAnnouncementTypes.length > 0) {
        const includesType = selectedAnnouncementTypes.includes(row.type);
        if (announcementTypeOperator === "in" && !includesType) {
          return false;
        }
        if (announcementTypeOperator === "not-in" && includesType) {
          return false;
        }
      }

      return true;
    });
  }, [announcementTypeOperator, searchValue, selectedAnnouncementTypes]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "type") {
      setSelectedAnnouncementTypes([]);
      setAnnouncementTypeOperator("in");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "type") {
      setSelectedAnnouncementTypes([]);
      setAnnouncementTypeOperator("in");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedAnnouncementTypes([]);
    setAnnouncementTypeOperator("in");
    setShowChart(false);
    setPeriodicRefresh(true);
    setSelectedInterval("all-time");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_ANNOUNCEMENTS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-announcements-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        selectedAnnouncementTypes,
        announcementTypeOperator,
      },
    };

    instanceAnnouncementsSavedFiltersStorage.save(filter);
    setSavedFilters(instanceAnnouncementsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedAnnouncementTypes((state.selectedAnnouncementTypes as string[] | undefined) ?? []);
    setAnnouncementTypeOperator((state.announcementTypeOperator as "in" | "not-in" | undefined) ?? "in");
    setSelectedInterval(state.selectedInterval ?? "all-time");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    if ((state.selectedAnnouncementTypes ?? []).length > 0) {
      restoredVisibleFilters.push("type");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceAnnouncementsSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceAnnouncementsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceAnnouncementsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceAnnouncementsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing announcements data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Announcements</h1>
            <span className="text-sm text-muted-foreground">Instance Administration</span>
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
          selectedPlugins={[]}
          pluginOperator="in"
          onPluginSelectionChange={() => {}}
          onPluginOperatorChange={() => {}}
          pluginOptions={[]}
          selectedAnnouncementTypes={selectedAnnouncementTypes}
          announcementTypeOperator={announcementTypeOperator}
          onAnnouncementTypesChange={setSelectedAnnouncementTypes}
          onAnnouncementTypeOperatorChange={setAnnouncementTypeOperator}
          announcementTypeOptions={ANNOUNCEMENT_TYPE_OPTIONS}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={INSTANCE_ANNOUNCEMENTS_FILTER_OPTIONS}
          searchPlaceholder="Search..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <AnnouncementsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
