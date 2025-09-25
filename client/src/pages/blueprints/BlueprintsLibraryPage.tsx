import { useMemo, useState, type ComponentType } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import type { TagOption } from "@/components/TagsFilterEditor";
import { SavedFilter } from "@/types/savedFilters";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  BellRing,
  BookOpen,
  Braces,
  Cloud,
  CloudLightning,
  Cloudy,
  Database,
  Cpu,
  GitBranch,
  Globe,
  Hammer,
  Layers,
  MessageSquare,
  PieChart,
  Radar,
  Server,
  Terminal,
  Workflow,
  Pencil,
} from "lucide-react";

export const BLUEPRINT_PLUGIN_LIBRARY = {
  pagerduty: { label: "PagerDuty", icon: BellRing },
  slack: { label: "Slack", icon: MessageSquare },
  notion: { label: "Notion", icon: BookOpen },
  kestra: { label: "Kestra", icon: Workflow },
  airbyte: { label: "Airbyte", icon: Radar },
  dbt: { label: "dbt", icon: Hammer },
  python: { label: "Python", icon: Braces },
  aws: { label: "AWS", icon: Cloud },
  gcp: { label: "GCP", icon: Cloudy },
  azure: { label: "Azure", icon: CloudLightning },
  api: { label: "API", icon: Globe },
  cli: { label: "CLI", icon: Terminal },
  git: { label: "Git", icon: GitBranch },
  analytics: { label: "Analytics", icon: BarChart3 },
  ai: { label: "AI", icon: Cpu },
  reporting: { label: "Reporting", icon: PieChart },
  infrastructure: { label: "Infrastructure", icon: Server },
  database: { label: "Database", icon: Database },
  workspace: { label: "Workspace", icon: Layers },
} satisfies Record<string, { label: string; icon: ComponentType<{ className?: string }> }>;

export type BlueprintPluginId = keyof typeof BLUEPRINT_PLUGIN_LIBRARY;

export interface BlueprintCard {
  id: string;
  name: string;
  description: string;
  tags: string[];
  plugins: BlueprintPluginId[];
}

interface BlueprintsLibraryPageProps {
  title: string;
  subtitle: string;
  tagOptions: TagOption[];
  blueprints: BlueprintCard[];
  savedFilterNamespace: string;
  searchPlaceholder?: string;
  allowEdit?: boolean;
  showCreateButton?: boolean;
}

const TAG_FILTER_OPTIONS: FilterOption[] = [
  { id: "tags", label: "Tags", description: "Filter by blueprint tags", enabled: true, order: 1 },
];

const DEFAULT_VISIBLE_FILTERS = ["tags"];
const PAGE_SIZE_OPTIONS = ["9", "18", "27"];

export function BlueprintsLibraryPage({
  title,
  subtitle,
  tagOptions,
  blueprints,
  savedFilterNamespace,
  searchPlaceholder = "Search blueprints...",
  allowEdit = false,
  showCreateButton = false,
}: BlueprintsLibraryPageProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsOperator, setTagsOperator] = useState("in");
  const [tagsCustomValue, setTagsCustomValue] = useState("");
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const normalizedSelectedTags = useMemo(
    () => selectedTags.map((tag) => tag.toLowerCase()),
    [selectedTags],
  );
  const normalizedCustomValue = tagsCustomValue.trim().toLowerCase();

  const filteredBlueprints = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return blueprints.filter((blueprint) => {
      if (query) {
        const haystack = `${blueprint.name} ${blueprint.description}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (!visibleFilters.includes("tags")) {
        return true;
      }

      if (["contains", "starts-with", "ends-with"].includes(tagsOperator)) {
        if (!normalizedCustomValue) {
          return true;
        }

        return blueprint.tags.some((tag) => {
          const normalizedTag = tag.toLowerCase();
          if (tagsOperator === "contains") {
            return normalizedTag.includes(normalizedCustomValue);
          }
          if (tagsOperator === "starts-with") {
            return normalizedTag.startsWith(normalizedCustomValue);
          }
          return normalizedTag.endsWith(normalizedCustomValue);
        });
      }

      if (tagsOperator === "not-in") {
        if (normalizedSelectedTags.length === 0) {
          return true;
        }
        return blueprint.tags.every((tag) => !normalizedSelectedTags.includes(tag.toLowerCase()));
      }

      if (normalizedSelectedTags.length === 0) {
        return true;
      }

      return blueprint.tags.some((tag) => normalizedSelectedTags.includes(tag.toLowerCase()));
    });
  }, [blueprints, normalizedCustomValue, normalizedSelectedTags, searchValue, tagsOperator, visibleFilters]);

  const paginatedBlueprints = useMemo(() => {
    const limit = Number(pageSize);
    return Number.isFinite(limit) ? filteredBlueprints.slice(0, limit) : filteredBlueprints;
  }, [filteredBlueprints, pageSize]);

  const activeFilters = useMemo(() => {
    if (!visibleFilters.includes("tags")) {
      return [];
    }

    if (["contains", "starts-with", "ends-with"].includes(tagsOperator)) {
      const value = normalizedCustomValue ? tagsCustomValue.trim() : "All";
      return [
        {
          id: "tags",
          label: "Tags",
          value,
          operator: tagsOperator,
        },
      ];
    }

    if (selectedTags.length === 0) {
      return [
        {
          id: "tags",
          label: "Tags",
          value: "All",
          operator: tagsOperator,
        },
      ];
    }

    const displayValue = selectedTags.length <= 2
      ? selectedTags.join(", ")
      : `${selectedTags.length} selected`;

    return [
      {
        id: "tags",
        label: "Tags",
        value: displayValue,
        operator: tagsOperator,
      },
    ];
  }, [normalizedCustomValue, selectedTags, tagsCustomValue, tagsOperator, visibleFilters]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === "tags") {
      setSelectedTags([]);
      setTagsOperator("in");
      setTagsCustomValue("");
      if (!visibleFilters.includes("tags")) {
        setVisibleFilters([...visibleFilters, "tags"]);
      }
    }
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "tags") {
      setSelectedTags([]);
      setTagsOperator("in");
      setTagsCustomValue("");
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedTags([]);
    setTagsOperator("in");
    setTagsCustomValue("");
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setShowChart(false);
    setPeriodicRefresh(false);
    setColumns([]);
  };

  const handleTagsSelectionChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleTagsOperatorChange = (operator: string) => {
    setTagsOperator(operator);
  };

  const handleTagsCustomValueChange = (value: string) => {
    setTagsCustomValue(value);
  };

  const handleVisibleFiltersChange = (filters: string[]) => {
    if (!filters.includes("tags")) {
      setVisibleFilters(["tags"]);
      return;
    }
    setVisibleFilters(filters);
  };

  const handleRefreshData = () => {
    console.log(`Refreshing ${savedFilterNamespace} data...`);
  };

  const handleSaveFilter = (name: string, description: string) => {
    const timestamp = new Date().toISOString();
    const newFilter: SavedFilter = {
      id: `${savedFilterNamespace}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: timestamp,
      updatedAt: timestamp,
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
        selectedTags,
        tagsOperator,
        tagsCustomValue,
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

    setSavedFilters((prev) => [...prev, newFilter]);
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedTags(state.selectedTags ?? []);
    setTagsOperator(state.tagsOperator ?? "in");
    setTagsCustomValue(state.tagsCustomValue ?? "");
    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];
    if (!restoredVisibleFilters.includes("tags")) {
      restoredVisibleFilters.push("tags");
    }
    setVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== filterId));
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    setSavedFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId
          ? {
              ...filter,
              name,
              description,
              updatedAt: new Date().toISOString(),
            }
          : filter,
      ),
    );
  };

  const noop = () => {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Jump to...</span>
            <span>Ctrl+Cmd+K</span>
            {showCreateButton && (
              <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover-elevate">
                Create
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">
        <FilterInterface
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilters={activeFilters}
          onClearFilter={handleClearFilter}
          onEditFilter={noop}
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
          selectedTags={selectedTags}
          tagsOperator={tagsOperator}
          tagsCustomValue={tagsCustomValue}
          onTagsSelectionChange={handleTagsSelectionChange}
          onTagsOperatorChange={handleTagsOperatorChange}
          onTagsCustomValueChange={handleTagsCustomValueChange}
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
          filterOptions={TAG_FILTER_OPTIONS}
          tagOptions={tagOptions}
          searchPlaceholder={searchPlaceholder}
          showChartToggleControl={false}
          showColumnsControl={false}
          showPeriodicRefreshControl={false}
        />

        <section className="flex-1 overflow-auto p-6">
          {paginatedBlueprints.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-lg p-12">
              No blueprints match the current filters.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginatedBlueprints.map((blueprint) => (
                <Card
                  key={blueprint.id}
                  className="border border-border/60 bg-[#262A35] shadow-sm transition hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex h-full flex-col gap-4 p-5">
                    <div className="flex flex-wrap gap-2">
                      {blueprint.tags.map((tag) => (
                        <Badge
                          key={`${blueprint.id}-${tag}`}
                          variant="secondary"
                          className="border border-border/40 bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h2 className="text-base font-semibold text-foreground leading-snug">
                      {blueprint.name}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {blueprint.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {blueprint.plugins.map((pluginId) => {
                          const plugin = BLUEPRINT_PLUGIN_LIBRARY[pluginId];
                          if (!plugin) {
                            return null;
                          }
                          const Icon = plugin.icon;
                          return (
                            <Tooltip key={`${blueprint.id}-${pluginId}`}>
                              <TooltipTrigger asChild>
                                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-muted/30 text-muted-foreground transition hover:border-primary/60 hover:text-primary">
                                  <Icon className="h-4 w-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{plugin.label}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        {allowEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md border border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground"
                                aria-label="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        )}
                        <Button size="sm" className="h-8 px-3">
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="border-t border-border/60 bg-[#262A35]/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
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
          <span>Total: {filteredBlueprints.length}</span>
        </div>
      </main>
    </div>
  );
}

export default BlueprintsLibraryPage;
