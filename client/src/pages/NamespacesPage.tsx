import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Removed unused Collapsible imports
import { ChevronDown, ChevronRight, Folder, FileText } from "lucide-react";
import type { ColumnConfig } from "@/types/savedFilters";
import { SavedFilter } from "@/types/savedFilters";
import { namespacesSavedFiltersStorage } from "@/utils/namespacesSavedFiltersStorage";

interface NamespaceCard {
  name: string;
  owner: string;
  description: string;
}

interface NamespaceNode {
  name: string;
  fullPath: string;
  owner: string;
  description: string;
  children: NamespaceNode[];
  isLeaf: boolean;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const NAMESPACES_FILTER_OPTIONS: FilterOption[] = [
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: false, order: 1 },
];

const MOCK_NAMESPACE_CARDS: NamespaceCard[] = [
  {
    name: "company",
    owner: "platform-team",
    description: "Root namespace for all platform flows and resources",
  },
  {
    name: "company.analytics",
    owner: "analytics",
    description: "Data pipelines and insights for analytics",
  },
  {
    name: "company.team.backend",
    owner: "backend",
    description: "Backend microservices orchestration",
  },
  {
    name: "company.team.frontend",
    owner: "frontend",
    description: "Front-end asset generation tasks",
  },
  {
    name: "company.security",
    owner: "security",
    description: "Security operations and response workflows",
  },
  {
    name: "tutorial",
    owner: "education",
    description: "Guided examples and tutorials",
  },
];

const PAGE_SIZE_OPTIONS = ["6", "12", "24"];

const NAMESPACE_OPTIONS = MOCK_NAMESPACE_CARDS.map((card) => card.name).sort((a, b) => a.localeCompare(b));

// Function to build tree structure from flat namespace list
function buildNamespaceTree(namespaces: NamespaceCard[]): NamespaceNode[] {
  const nodes: NamespaceNode[] = [];
  const nodeMap = new Map<string, NamespaceNode>();

  // Sort namespaces by name to ensure proper hierarchy
  const sortedNamespaces = [...namespaces].sort((a, b) => a.name.localeCompare(b.name));

  // Create all nodes first
  for (const namespace of sortedNamespaces) {
    const node: NamespaceNode = {
      name: namespace.name,
      fullPath: namespace.name,
      owner: namespace.owner,
      description: namespace.description,
      children: [],
      isLeaf: true, // Will be updated if children are found
    };
    nodeMap.set(namespace.name, node);
  }

  // Build the tree structure
  for (const namespace of sortedNamespaces) {
    const node = nodeMap.get(namespace.name)!;
    const parts = namespace.name.split('.');
    
    if (parts.length === 1) {
      // Root level namespace
      nodes.push(node);
    } else {
      // Find parent
      for (let i = parts.length - 1; i > 0; i--) {
        const parentPath = parts.slice(0, i).join('.');
        const parent = nodeMap.get(parentPath);
        if (parent) {
          parent.children.push(node);
          parent.isLeaf = false;
          break;
        }
      }
    }
  }

  return nodes;
}

// Function to build filtered tree structure that preserves parent-child relationships
function buildFilteredNamespaceTree(filteredNamespaces: NamespaceCard[], allNamespaces: NamespaceCard[]): NamespaceNode[] {
  // Create a map of existing namespace data
  const namespaceDataMap = new Map<string, NamespaceCard>();
  allNamespaces.forEach(ns => namespaceDataMap.set(ns.name, ns));
  
  // Identify all namespaces that should be included (matches + their ancestors)
  const requiredNamespaces = new Set<string>();
  
  // Add all filtered namespaces
  filteredNamespaces.forEach(ns => requiredNamespaces.add(ns.name));
  
  // Add ancestors of filtered namespaces to maintain hierarchy
  filteredNamespaces.forEach(ns => {
    const parts = ns.name.split('.');
    for (let i = 1; i < parts.length; i++) {
      const ancestorPath = parts.slice(0, i).join('.');
      requiredNamespaces.add(ancestorPath);
    }
  });
  
  // Create namespace data for all required namespaces (synthesize missing ones)
  const requiredNamespaceData: NamespaceCard[] = [];
  
  requiredNamespaces.forEach(namespacePath => {
    const existing = namespaceDataMap.get(namespacePath);
    if (existing) {
      // Use existing namespace data
      requiredNamespaceData.push(existing);
    } else {
      // Create virtual namespace node for missing intermediate path
      const parts = namespacePath.split('.');
      const lastPart = parts[parts.length - 1];
      requiredNamespaceData.push({
        name: namespacePath,
        owner: "system", // Virtual node
        description: `Virtual namespace container for ${lastPart}`,
      });
    }
  });
  
  // Build tree with required namespaces (both real and virtual)
  return buildNamespaceTree(requiredNamespaceData);
}

const NAMESPACES_COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Namespace", description: "Namespace identifier", visible: true, order: 1 },
  { id: "owner", label: "Owner", description: "Team responsible for the namespace", visible: true, order: 2 },
  { id: "description", label: "Description", description: "Namespace purpose", visible: true, order: 3 },
];

export default function NamespacesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState("");
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(NAMESPACES_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["company"]));

  useEffect(() => {
    setSavedFilters(namespacesSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    const trimmedNamespace = namespaceCustomValue.trim();
    const usesSelectionOperator = ["in", "not-in"].includes(namespaceOperator);
    const usesTextOperator = ["contains", "starts-with", "ends-with"].includes(namespaceOperator);
    const hasSelection = selectedNamespaces.length > 0;
    const hasText = trimmedNamespace.length > 0;

    if (visibleFilters.includes("namespace") && (hasSelection || hasText)) {
      const operatorLabels: Record<string, string> = {
        "in": "in",
        "not-in": "not in",
        "contains": "contains",
        "starts-with": "starts with",
        "ends-with": "ends with",
      };

      let value = "";
      if (usesSelectionOperator && hasSelection) {
        value = selectedNamespaces.length === 1 ? selectedNamespaces[0] : `${selectedNamespaces.length} selected`;
      } else if (usesTextOperator && hasText) {
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

  const filteredCards = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const namespaceSet = new Set(selectedNamespaces);
    const trimmedNamespace = namespaceCustomValue.trim().toLowerCase();
    const operator = namespaceOperator;

    return MOCK_NAMESPACE_CARDS.filter((card) => {
      if (searchTerm) {
        const haystack = `${card.name} ${card.owner} ${card.description}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      const namespaceLower = card.name.toLowerCase();

      if (["in", "not-in"].includes(operator) && namespaceSet.size > 0) {
        const isIncluded = namespaceSet.has(card.name);
        if (operator === "in" && !isIncluded) {
          return false;
        }
        if (operator === "not-in" && isIncluded) {
          return false;
        }
      }

      if (["contains", "starts-with", "ends-with"].includes(operator) && trimmedNamespace) {
        if (operator === "contains" && !namespaceLower.includes(trimmedNamespace)) {
          return false;
        }
        if (operator === "starts-with" && !namespaceLower.startsWith(trimmedNamespace)) {
          return false;
        }
        if (operator === "ends-with" && !namespaceLower.endsWith(trimmedNamespace)) {
          return false;
        }
      }

      return true;
    });
  }, [namespaceCustomValue, namespaceOperator, searchValue, selectedNamespaces]);

  const namespaceTree = useMemo(() => {
    return buildFilteredNamespaceTree(filteredCards, MOCK_NAMESPACE_CARDS);
  }, [filteredCards]);

  // Auto-expand ancestor chains for filtered results
  useEffect(() => {
    const ancestorsToExpand = new Set<string>();
    
    filteredCards.forEach(ns => {
      const parts = ns.name.split('.');
      // Add all ancestor paths that should be expanded
      for (let i = 1; i < parts.length; i++) {
        const ancestorPath = parts.slice(0, i).join('.');
        ancestorsToExpand.add(ancestorPath);
      }
    });

    // Merge with existing expanded nodes, keeping user's manual expansions
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      ancestorsToExpand.forEach(ancestor => newSet.add(ancestor));
      return newSet;
    });
  }, [filteredCards]);

  const toggleNodeExpansion = (nodePath: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  };

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
    setColumns(NAMESPACES_COLUMNS.map((column) => ({ ...column })));
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
      id: `namespaces-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    namespacesSavedFiltersStorage.save(filter);
    setSavedFilters(namespacesSavedFiltersStorage.getAll());
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
    namespacesSavedFiltersStorage.delete(filterId);
    setSavedFilters(namespacesSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    namespacesSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(namespacesSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing namespaces data...");
  };

  const renderTreeNode = (node: NamespaceNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.fullPath);
    const hasChildren = node.children.length > 0;
    const paddingLeft = depth * 20;

    return (
      <div key={node.fullPath} className="w-full">
        <div
          className="flex items-center p-3 rounded-lg hover:bg-[#2F3341] border border-border/40 mb-2 bg-[#262A35] cursor-pointer transition-colors"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          data-testid={`namespace-node-${node.fullPath}`}
          onClick={hasChildren ? () => toggleNodeExpansion(node.fullPath) : undefined}
        >
          {hasChildren ? (
            <>
              <button
                className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
                data-testid={`expand-toggle-${node.fullPath}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(node.fullPath);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Folder className="h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{node.name}</span>
                    <span className="text-xs text-muted-foreground">{node.owner}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{node.description}</p>
                </div>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-4" /> {/* Spacer for alignment */}
              <FileText className="h-4 w-4 text-green-400" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{node.name}</span>
                  <span className="text-xs text-muted-foreground">{node.owner}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{node.description}</p>
              </div>
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">Namespaces</h1>
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
          flowOperator="in"
          flowCustomValue=""
          onFlowsSelectionChange={() => {}}
          onFlowOperatorChange={() => {}}
          onFlowCustomValueChange={() => {}}
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
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={NAMESPACES_FILTER_OPTIONS}
          searchPlaceholder="Search namespaces..."
          showChartToggleControl={false}
          showColumnsControl={false}
        />

        <div className="flex-1 overflow-auto p-6 bg-[#1F232D]">
          <div className="max-w-4xl mx-auto space-y-2">
            {namespaceTree.length > 0 ? (
              namespaceTree.map(node => renderTreeNode(node))
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No namespaces found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
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
          <span>Total: {filteredCards.length}</span>
        </div>
      </main>
    </div>
  );
}

