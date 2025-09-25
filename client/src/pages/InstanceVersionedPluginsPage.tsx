import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import VersionedPluginsTable, { type VersionedPluginRow } from "@/components/VersionedPluginsTable";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { instanceVersionedPluginsSavedFiltersStorage } from "@/utils/instanceVersionedPluginsSavedFiltersStorage";

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_VERSIONED_PLUGINS_FILTER_OPTIONS: FilterOption[] = [
  { id: "plugin", label: "Plugin", description: "Filter by plugin", enabled: false, order: 1 },
];

const INSTANCE_VERSIONED_PLUGINS_COLUMNS: ColumnConfig[] = [
  { id: "plugin", label: "Plugin", description: "Installed plugin category", visible: true, order: 1 },
  { id: "versions", label: "Versions installed", description: "All installed versions", visible: true, order: 2 },
];

const VERSIONED_PLUGINS_ROWS: VersionedPluginRow[] = [
  {
    plugin: "AI",
    versions: ["1.0.0"],
  },
  {
    plugin: "Airbyte",
    versions: ["1.0.0", "0.24.0"],
  },
  {
    plugin: "AWS",
    versions: ["1.0.0", "1.0.1"],
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

export default function InstanceVersionedPluginsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [pluginOperator, setPluginOperator] = useState<"in" | "not-in">("in");
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState("all-time");
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_VERSIONED_PLUGINS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceVersionedPluginsSavedFiltersStorage.getAll());
  }, []);

  const pluginOptions = useMemo(
    () => VERSIONED_PLUGINS_ROWS.map((row) => ({ value: row.plugin, label: row.plugin })),
    [],
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("plugin") && selectedPlugins.length > 0) {
      const valueLabel = selectedPlugins.join(", ");
      filters.push({
        id: "plugin",
        label: "Plugin",
        value: valueLabel,
        operator: pluginOperator === "not-in" ? "not in" : "in",
      });
    }

    return filters;
  }, [pluginOperator, selectedPlugins, visibleFilters]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();

    return VERSIONED_PLUGINS_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.plugin} ${row.versions.join(" ")}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (selectedPlugins.length > 0) {
        const includesPlugin = selectedPlugins.includes(row.plugin);
        if (pluginOperator === "in" && !includesPlugin) {
          return false;
        }
        if (pluginOperator === "not-in" && includesPlugin) {
          return false;
        }
      }

      return true;
    });
  }, [pluginOperator, searchValue, selectedPlugins]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "plugin") {
      setSelectedPlugins([]);
      setPluginOperator("in");
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "plugin") {
      setSelectedPlugins([]);
      setPluginOperator("in");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedPlugins([]);
    setPluginOperator("in");
    setShowChart(false);
    setPeriodicRefresh(true);
    setSelectedInterval("all-time");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_VERSIONED_PLUGINS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-versioned-plugins-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        selectedPlugins,
        pluginOperator,
      },
    };

    instanceVersionedPluginsSavedFiltersStorage.save(filter);
    setSavedFilters(instanceVersionedPluginsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedPlugins((state.selectedPlugins as string[] | undefined) ?? []);
    setPluginOperator((state.pluginOperator as "in" | "not-in" | undefined) ?? "in");
    setSelectedInterval(state.selectedInterval ?? "all-time");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    if ((state.selectedPlugins ?? []).length > 0) {
      restoredVisibleFilters.push("plugin");
    }

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceVersionedPluginsSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceVersionedPluginsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceVersionedPluginsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceVersionedPluginsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing versioned plugins data...");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Instance Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Versioned Plugins</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover-elevate">
              Upload
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
          selectedPlugins={selectedPlugins}
          pluginOperator={pluginOperator}
          onPluginSelectionChange={(plugins) => setSelectedPlugins(plugins)}
          onPluginOperatorChange={(operator) => setPluginOperator(operator)}
          pluginOptions={pluginOptions}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={INSTANCE_VERSIONED_PLUGINS_FILTER_OPTIONS}
          searchPlaceholder="Search plugins..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <VersionedPluginsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
