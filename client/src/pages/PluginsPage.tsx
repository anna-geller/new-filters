import { useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import type { TagOption } from "@/components/TagsFilterEditor";
import { SavedFilter } from "@/types/savedFilters";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Activity,
  Bell,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  MessageSquare,
  Puzzle,
  Radar,
  Server,
  Sparkles,
  Workflow,
} from "lucide-react";

interface PluginDefinition {
  id: string;
  name: string;
  icon: typeof Puzzle;
  categories: string[];
}

const PLUGIN_FILTER_OPTIONS: FilterOption[] = [
  { id: "tags", label: "Plugin Category", description: "Filter plugins by category", enabled: true, order: 1 },
];

const PLUGIN_CATEGORY_OPTIONS: TagOption[] = [
  { id: "AI", label: "AI" },
  { id: "Analytics", label: "Analytics" },
  { id: "Compute", label: "Compute" },
  { id: "Data", label: "Data" },
  { id: "Integrations", label: "Integrations" },
  { id: "Messaging", label: "Messaging" },
  { id: "Notifications", label: "Notifications" },
  { id: "Operations", label: "Operations" },
  { id: "Orchestration", label: "Orchestration" },
  { id: "Source Control", label: "Source Control" },
  { id: "Storage", label: "Storage" },
];

const PLUGINS: PluginDefinition[] = [
  { id: "slack", name: "Slack", icon: MessageSquare, categories: ["Messaging", "Notifications", "Integrations"] },
  { id: "pagerduty", name: "PagerDuty", icon: Bell, categories: ["Operations", "Notifications"] },
  { id: "snowflake", name: "Snowflake", icon: Database, categories: ["Data", "Analytics", "Storage"] },
  { id: "bigquery", name: "BigQuery", icon: Cloud, categories: ["Data", "Analytics"] },
  { id: "github", name: "GitHub", icon: GitBranch, categories: ["Source Control", "Integrations"] },
  { id: "airbyte", name: "Airbyte", icon: Radar, categories: ["Data", "Orchestration"] },
  { id: "spark", name: "Apache Spark", icon: Activity, categories: ["Compute", "Analytics"] },
  { id: "openai", name: "OpenAI", icon: Sparkles, categories: ["AI", "Integrations"] },
  { id: "aws-lambda", name: "AWS Lambda", icon: Server, categories: ["Compute", "Operations"] },
  { id: "dbt", name: "dbt", icon: Workflow, categories: ["Analytics", "Orchestration"] },
  { id: "kafka", name: "Kafka", icon: Puzzle, categories: ["Messaging", "Data"] },
  { id: "datadog", name: "Datadog", icon: Cpu, categories: ["Operations", "Integrations"] },
];

const DEFAULT_VISIBLE_FILTERS = ["tags"];

export default function PluginsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesOperator, setCategoriesOperator] = useState("in");
  const [categoriesCustomValue, setCategoriesCustomValue] = useState("");
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  const filteredPlugins = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return PLUGINS.filter((plugin) => {
      if (query) {
        const haystack = `${plugin.name} ${plugin.categories.join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (!visibleFilters.includes("tags")) {
        return true;
      }

      if (["contains", "starts-with", "ends-with"].includes(categoriesOperator)) {
        if (!categoriesCustomValue.trim()) {
          return true;
        }
        const candidate = categoriesCustomValue.trim().toLowerCase();
        return plugin.categories.some((category) => {
          const normalized = category.toLowerCase();
          if (categoriesOperator === "contains") return normalized.includes(candidate);
          if (categoriesOperator === "starts-with") return normalized.startsWith(candidate);
          return normalized.endsWith(candidate);
        });
      }

      if (categoriesOperator === "not-in") {
        if (selectedCategories.length === 0) {
          return true;
        }
        return plugin.categories.every((category) => !selectedCategories.includes(category));
      }

      if (selectedCategories.length === 0) {
        return true;
      }

      return plugin.categories.some((category) => selectedCategories.includes(category));
    });
  }, [categoriesCustomValue, categoriesOperator, searchValue, selectedCategories, visibleFilters]);

  const activeFilters = useMemo(() => {
    if (!visibleFilters.includes("tags")) {
      return [];
    }

    if (["contains", "starts-with", "ends-with"].includes(categoriesOperator)) {
      return [
        {
          id: "tags",
          label: "Plugin Category",
          value: categoriesCustomValue.trim() || "All",
          operator: categoriesOperator,
        },
      ];
    }

    if (selectedCategories.length === 0) {
      return [
        {
          id: "tags",
          label: "Plugin Category",
          value: "All",
          operator: categoriesOperator,
        },
      ];
    }

    const value = selectedCategories.length <= 2
      ? selectedCategories.join(", ")
      : `${selectedCategories.length} selected`;

    return [
      {
        id: "tags",
        label: "Plugin Category",
        value,
        operator: categoriesOperator,
      },
    ];
  }, [categoriesCustomValue, categoriesOperator, selectedCategories, visibleFilters]);

  const handleVisibleFiltersChange = (filters: string[]) => {
    if (!filters.includes("tags")) {
      setVisibleFilters(["tags"]);
      return;
    }
    setVisibleFilters(filters);
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedCategories([]);
    setCategoriesOperator("in");
    setCategoriesCustomValue("");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "tags") {
      setSelectedCategories([]);
      setCategoriesOperator("in");
      setCategoriesCustomValue("");
    }
  };

  const handleSaveFilter = (name: string, description: string) => {
    const timestamp = new Date().toISOString();
    const filter: SavedFilter = {
      id: `plugins-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      description,
      createdAt: timestamp,
      updatedAt: timestamp,
      filterState: {
        searchValue,
        selectedStates: [],
        statesOperator: "in",
        selectedInterval: "all-time",
        selectedLabels: [],
        labelsOperator: "has-any-of",
        labelsCustomValue: "",
        selectedTags: selectedCategories,
        tagsOperator: categoriesOperator,
        tagsCustomValue: categoriesCustomValue,
        selectedInputs: [],
        inputsOperator: "has-any-of",
        inputsCustomValue: "",
        selectedOutputs: [],
        outputsOperator: "has-any-of",
        outputsCustomValue: "",
        enabledValue: null,
        selectedLocked: null,
        selectedMissingSource: null,
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
        userValue: "",
        selectedSuperadminStatuses: [],
        superadminOperator: "in",
        selectedInvitationStatuses: [],
        invitationStatusOperator: "in",
        selectedPlugins: [],
        pluginOperator: "in",
        selectedAnnouncementTypes: [],
        announcementTypeOperator: "in",
        selectedServiceTypes: [],
        serviceTypeOperator: "in",
        selectedBindingTypes: [],
      },
    };
    setSavedFilters((prev) => [...prev, filter]);
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedCategories(state.selectedTags ?? []);
    setCategoriesOperator(state.tagsOperator ?? "in");
    setCategoriesCustomValue(state.tagsCustomValue ?? "");

    const restored = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];
    if (!restored.includes("tags")) {
      restored.push("tags");
    }
    setVisibleFilters(restored);
  };

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== filterId));
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    setSavedFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId
          ? { ...filter, name, description, updatedAt: new Date().toISOString() }
          : filter,
      ),
    );
  };

  const noop = () => {};

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">Plugins</h1>
            <span className="text-sm text-muted-foreground">Search for tasks and triggers to build your flow.</span>
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
          onClearFilter={handleResetFilter}
          onEditFilter={noop}
          onResetFilters={handleResetFilters}
          showChart={false}
          onToggleShowChart={noop}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={setPeriodicRefresh}
          onRefreshData={() => console.log("Refreshing plugins data...")}
          columns={columns}
          onColumnsChange={setColumns}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={noop}
          onStatesOperatorChange={noop}
          selectedInterval="all-time"
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={noop}
          selectedLabels={[]}
          labelsOperator="has-any-of"
          labelsCustomValue=""
          onLabelsSelectionChange={noop}
          onLabelsOperatorChange={noop}
          onLabelsCustomValueChange={noop}
          selectedInputs={[]}
          inputsOperator="has-any-of"
          inputsCustomValue=""
          onInputsSelectionChange={noop}
          onInputsOperatorChange={noop}
          onInputsCustomValueChange={noop}
          selectedOutputs={[]}
          outputsOperator="has-any-of"
          outputsCustomValue=""
          onOutputsSelectionChange={noop}
          onOutputsOperatorChange={noop}
          onOutputsCustomValueChange={noop}
          selectedNamespaces={[]}
          namespaceOperator="in"
          namespaceCustomValue=""
          onNamespacesSelectionChange={noop}
          onNamespaceOperatorChange={noop}
          onNamespaceCustomValueChange={noop}
          selectedFlows={[]}
          onFlowsSelectionChange={noop}
          selectedTags={selectedCategories}
          tagsOperator={categoriesOperator}
          tagsCustomValue={categoriesCustomValue}
          onTagsSelectionChange={setSelectedCategories}
          onTagsOperatorChange={setCategoriesOperator}
          onTagsCustomValueChange={setCategoriesCustomValue}
          selectedEnabled={null}
          onEnabledChange={noop}
          selectedScopes={[]}
          onScopesSelectionChange={noop}
          selectedKinds={[]}
          onKindsSelectionChange={noop}
          selectedHierarchy="all"
          onHierarchySelectionChange={noop}
          selectedInitialExecution=""
          onInitialExecutionSelectionChange={noop}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={handleVisibleFiltersChange}
          onResetFilter={handleResetFilter}
          filterOptions={PLUGIN_FILTER_OPTIONS}
          tagOptions={PLUGIN_CATEGORY_OPTIONS}
          searchPlaceholder="Search plugins..."
          showChartToggleControl={false}
          showColumnsControl={false}
          showPeriodicRefreshControl={false}
        />

        <section className="flex-1 overflow-auto px-6 pb-6">
          {filteredPlugins.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-sm text-muted-foreground">
              No plugins match the current filters.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {filteredPlugins.map((plugin) => {
                const Icon = plugin.icon;
                return (
                  <Tooltip key={plugin.id}>
                    <TooltipTrigger asChild>
                      <Card className="flex h-28 flex-col items-center justify-center gap-3 border border-border/60 bg-card/70 p-4 text-center shadow-sm transition hover:border-primary/50 hover:shadow-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">{plugin.name}</p>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      {plugin.categories.join(", ")}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
