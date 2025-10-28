import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import AssetsTable, { type AssetTableRow } from "@/components/AssetsTable";
import type { ColumnConfig } from "@/types/savedFilters";
import { SavedFilter } from "@/types/savedFilters";
import { assetsSavedFiltersStorage } from "@/utils/assetsSavedFiltersStorage";
import type { FlowOption } from "@/components/FlowFilterEditor";
import type { AssetExecutionSummary, AssetRecord, AssetFlowLink } from "@/types/assets";
import { APPS } from "@/data/apps";
import { FLOWS } from "@/data/flows";
import {
  getAllAssets,
  subscribeToAssetChanges,
  upsertCustomAsset,
} from "@/utils/assetCatalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { composeAssetKey } from "@/utils/assetKeys";

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const ASSET_FILTER_OPTIONS: FilterOption[] = [
  { id: "namespace", label: "Namespace", description: "Filter by namespace", enabled: false, order: 1 },
  { id: "flow", label: "Flow", description: "Filter by related flow", enabled: false, order: 2 },
  { id: "type", label: "Type", description: "Filter by asset type", enabled: false, order: 3 },
];

const ASSET_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "ID", description: "Unique identifier of the asset", visible: true, order: 1 },
  { id: "namespace", label: "Namespace", description: "Namespace that owns the asset", visible: true, order: 2 },
  {
    id: "displayName",
    label: "Display name",
    description: "Human friendly name of the asset",
    visible: true,
    order: 3,
  },
  { id: "type", label: "Type", description: "Classification of the asset", visible: true, order: 4 },
  {
    id: "description",
    label: "Description",
    description: "Optional Markdown description for the asset",
    visible: false,
    order: 5,
  },
  {
    id: "relatedAssets",
    label: "Related Assets",
    description: "Assets that reference or depend on this asset",
    visible: false,
    order: 6,
  },
  {
    id: "relatedApps",
    label: "Related Apps",
    description: "Apps that interact with this asset",
    visible: false,
    order: 7,
  },
  { id: "relatedFlows", label: "Related Flows", description: "Flows that reference this asset", visible: true, order: 8 },
  { id: "lastExecution", label: "Last execution", description: "Most recent execution touching this asset", visible: true, order: 9 },
];

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const operatorDisplay: Record<string, string> = {
  in: "in",
  "not-in": "not in",
  contains: "contains",
  "starts-with": "starts with",
  "ends-with": "ends with",
};

interface AssetFormState {
  id: string;
  type: string;
  namespace: string;
  displayName: string;
  description: string;
  emitEvents: boolean;
  relatedAssets: string[];
  relatedApps: string[];
  relatedFlows: string[];
}

const EMPTY_FORM_STATE: AssetFormState = {
  id: "",
  type: "",
  namespace: "",
  displayName: "",
  description: "",
  emitEvents: false,
  relatedAssets: [],
  relatedApps: [],
  relatedFlows: [],
};

export default function AssetsPage() {
  const { toast } = useToast();
  const [assetRecords, setAssetRecords] = useState<AssetRecord[]>(() => getAllAssets());
  const [searchValue, setSearchValue] = useState("");
  const [columns, setColumns] = useState<ColumnConfig[]>(ASSET_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState<string>("in");
  const [namespaceCustomValue, setNamespaceCustomValue] = useState<string>("");

  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [flowOperator, setFlowOperator] = useState<string>("in");
  const [flowCustomValue, setFlowCustomValue] = useState<string>("");

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeOperator, setTypeOperator] = useState<"in" | "not-in">("in");

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [valuePairs, setValuePairs] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" },
  ]);
  const [formState, setFormState] = useState<AssetFormState>(() => ({ ...EMPTY_FORM_STATE }));
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [appPickerOpen, setAppPickerOpen] = useState(false);
  const [flowPickerOpen, setFlowPickerOpen] = useState(false);

  useEffect(() => {
    setSavedFilters(assetsSavedFiltersStorage.getAll());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAssetChanges(() => {
      setAssetRecords(getAllAssets());
    });

    return unsubscribe;
  }, []);

  const filteredAssets = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    const namespaceNeedle = namespaceCustomValue.trim().toLowerCase();
    const flowNeedle = flowCustomValue.trim().toLowerCase();

    return assetRecords.filter((asset) => {
      const relatedFlows = asset.relatedFlows ?? [];
      const flowNamespaces = relatedFlows
        .map((flow) => flow.namespace?.toLowerCase() ?? "")
        .filter((value) => value.length > 0);
      const flowsLower = relatedFlows.map((flow) => flow.flow.toLowerCase());
      const flowIdentifiers = relatedFlows.map((flow) => flow.flow);
      const assetNamespace = asset.namespace.trim();
      const assetNamespaceLower = assetNamespace.toLowerCase();

      if (term) {
        const valueStrings = Object.values(asset.values ?? {}).map((value) =>
          typeof value === "string" ? value : JSON.stringify(value),
        );
        const associatedAssets = asset.relatedAssets ?? [];
        const associatedApps = asset.relatedApps ?? [];
        const haystack = [
          asset.id,
          asset.displayName ?? "",
          asset.type,
          assetNamespace,
          asset.description ?? "",
          ...valueStrings,
          ...associatedAssets,
          ...associatedApps,
          ...flowIdentifiers,
          ...flowNamespaces,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      if (selectedNamespaces.length > 0 || namespaceNeedle) {
        if (namespaceOperator === "in" && selectedNamespaces.length > 0) {
          const match = selectedNamespaces.includes(assetNamespace);
          if (!match) return false;
        }

        if (namespaceOperator === "not-in" && selectedNamespaces.length > 0) {
          if (selectedNamespaces.includes(assetNamespace)) return false;
        }

        if (namespaceOperator === "contains" && namespaceNeedle) {
          if (!assetNamespaceLower.includes(namespaceNeedle)) return false;
        }

        if (namespaceOperator === "starts-with" && namespaceNeedle) {
          if (!assetNamespaceLower.startsWith(namespaceNeedle)) return false;
        }

        if (namespaceOperator === "ends-with" && namespaceNeedle) {
          if (!assetNamespaceLower.endsWith(namespaceNeedle)) return false;
        }
      }

      if (selectedFlows.length > 0 || flowNeedle) {
        if (flowOperator === "in" && selectedFlows.length > 0) {
          const match = relatedFlows.some((flow) => selectedFlows.includes(flow.flow));
          if (!match) return false;
        }

        if (flowOperator === "not-in" && selectedFlows.length > 0) {
          const hasDisallowed = relatedFlows.some((flow) => selectedFlows.includes(flow.flow));
          if (hasDisallowed) return false;
        }

        if (flowOperator === "contains" && flowNeedle) {
          const contains = flowsLower.some((flow) => flow.includes(flowNeedle));
          if (!contains) return false;
        }

        if (flowOperator === "starts-with" && flowNeedle) {
          const starts = flowsLower.some((flow) => flow.startsWith(flowNeedle));
          if (!starts) return false;
        }

        if (flowOperator === "ends-with" && flowNeedle) {
          const ends = flowsLower.some((flow) => flow.endsWith(flowNeedle));
          if (!ends) return false;
        }
      }

      if (selectedTypes.length > 0) {
        if (typeOperator === "in" && !selectedTypes.includes(asset.type)) {
          return false;
        }
        if (typeOperator === "not-in" && selectedTypes.includes(asset.type)) {
          return false;
        }
      }

      return true;
    });
  }, [
    assetRecords,
    searchValue,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    flowOperator,
    flowCustomValue,
    selectedTypes,
    typeOperator,
  ]);

  const getLastExecution = (executions?: AssetRecord["executions"]): AssetExecutionSummary | undefined => {
    if (!executions || executions.length === 0) {
      return undefined;
    }

    let latest = executions[0];
    let latestTime = new Date(latest.timestamp).getTime();

    for (let index = 1; index < executions.length; index += 1) {
      const execution = executions[index];
      const timestamp = new Date(execution.timestamp).getTime();
      if (!Number.isNaN(timestamp) && timestamp > latestTime) {
        latest = execution;
        latestTime = timestamp;
      }
    }

    return latest;
  };

  const updateFormField = <K extends keyof AssetFormState>(field: K, value: AssetFormState[K]) => {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState({ ...EMPTY_FORM_STATE });
    setValuePairs([{ key: "", value: "" }]);
    setAssetPickerOpen(false);
    setAppPickerOpen(false);
    setFlowPickerOpen(false);
  };

  const handleValuePairChange = (index: number, field: "key" | "value", nextValue: string) => {
    setValuePairs((previous) => {
      const updated = [...previous];
      updated[index] = { ...updated[index], [field]: nextValue };
      return updated;
    });
  };

  const addValuePair = () => {
    setValuePairs((previous) => [...previous, { key: "", value: "" }]);
  };

  const removeValuePair = (index: number) => {
    setValuePairs((previous) => {
      if (previous.length <= 1) {
        return previous;
      }
      return previous.filter((_, pairIndex) => pairIndex !== index);
    });
  };

  const toggleSelection = (collection: string[], value: string) => {
    if (collection.includes(value)) {
      return collection.filter((item) => item !== value);
    }
    return [...collection, value];
  };

  const buildValuesObject = () => {
    const result: Record<string, unknown> = {};

    valuePairs.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      if (!trimmedKey) {
        return;
      }

      const segments = trimmedKey.split(".").map((segment) => segment.trim()).filter(Boolean);
      if (segments.length === 0) {
        return;
      }

      let parsedValue: unknown = value;
      const candidate = value.trim();
      if (candidate.length > 0) {
        try {
          parsedValue = JSON.parse(candidate);
        } catch (error) {
          parsedValue = value;
        }
      } else {
        parsedValue = "";
      }

      let cursor: Record<string, unknown> = result;
      segments.forEach((segment, index) => {
        if (index === segments.length - 1) {
          cursor[segment] = parsedValue;
          return;
        }

        if (typeof cursor[segment] !== "object" || cursor[segment] === null) {
          cursor[segment] = {};
        }

        cursor = cursor[segment] as Record<string, unknown>;
      });
    });

    return result;
  };

  const handleAssetToggle = (assetId: string) => {
    updateFormField("relatedAssets", toggleSelection(formState.relatedAssets, assetId));
  };

  const handleAppToggle = (appId: string) => {
    updateFormField("relatedApps", toggleSelection(formState.relatedApps, appId));
  };

  const handleFlowToggle = (flowId: string) => {
    updateFormField("relatedFlows", toggleSelection(formState.relatedFlows, flowId));
  };

  const handleCreateAsset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedId = formState.id.trim();
    const trimmedType = formState.type.trim();
    const trimmedNamespace = formState.namespace.trim();
    const trimmedDescription = formState.description.trim();

    if (!trimmedId || !trimmedType || !trimmedNamespace) {
      toast({
        title: "Missing information",
        description: "ID, type, and namespace are required to create an asset.",
        variant: "destructive",
      });
      return;
    }

    const exists = assetRecords.some(
      (asset) => asset.id === trimmedId && asset.namespace === trimmedNamespace,
    );
    if (exists) {
      toast({
        title: "Asset already exists",
        description: `An asset with id "${trimmedId}" already exists in namespace "${trimmedNamespace}". Use a unique identifier for that namespace.`,
        variant: "destructive",
      });
      return;
    }

    const valuesObject = buildValuesObject();
    const hasValues = Object.keys(valuesObject).length > 0;
    const normalizedRelatedAssets = formState.relatedAssets.map((value) => value.trim()).filter(Boolean);
    const normalizedRelatedApps = formState.relatedApps.map((value) => value.trim()).filter(Boolean);

    const selectedFlows: AssetFlowLink[] = formState.relatedFlows
      .map((flowId) => {
        const flow = flowSelectOptions.find((option) => option.id === flowId);
        if (!flow) {
          return null;
        }
        return {
          flow: flow.id,
          namespace: flow.namespace,
        };
      })
      .filter(Boolean) as AssetFlowLink[];

    const newAsset: AssetRecord = {
      id: trimmedId,
      type: trimmedType,
      namespace: trimmedNamespace,
      displayName: formState.displayName.trim() || undefined,
      description: trimmedDescription || undefined,
      emitEvents: formState.emitEvents,
      relatedAssets: normalizedRelatedAssets,
      relatedApps: normalizedRelatedApps,
      relatedFlows: selectedFlows,
      values: hasValues ? valuesObject : undefined,
    };

    upsertCustomAsset(newAsset);
    setAssetRecords(getAllAssets());
    toast({
      title: "Asset created",
      description: `${trimmedNamespace}/${trimmedId} is now available in the catalog.`,
    });
    setCreateDialogOpen(false);
    resetForm();
  };

  const tableRows = useMemo<AssetTableRow[]>(
    () =>
      filteredAssets.map((asset) => ({
        id: asset.id,
        namespace: asset.namespace,
        displayName: asset.displayName,
        description: asset.description,
        type: asset.type,
        relatedAssets: asset.relatedAssets ?? [],
        relatedApps: asset.relatedApps ?? [],
        relatedFlows: asset.relatedFlows ?? [],
        lastExecution: getLastExecution(asset.executions),
      })),
    [filteredAssets],
  );

  const allRelatedFlows = useMemo(() => assetRecords.flatMap((asset) => asset.relatedFlows ?? []), [assetRecords]);

  const flowOptions: FlowOption[] = useMemo(() => {
    const uniqueFlows = Array.from(new Set(allRelatedFlows.map((flow) => flow.flow))).sort((a, b) =>
      a.localeCompare(b),
    );
    return uniqueFlows.map((flowId) => ({
      id: flowId,
      label: flowId,
      description: "Asset-related flow",
    }));
  }, [allRelatedFlows]);

  const namespaceOptions = useMemo(() => {
    const namespaces = Array.from(
      new Set(assetRecords.map((asset) => asset.namespace).filter((namespace) => namespace.trim().length > 0)),
    );
    namespaces.sort((a, b) => a.localeCompare(b));
    return namespaces;
  }, [assetRecords]);

  const assetTypeOptions = useMemo(
    () =>
      Array.from(new Set(assetRecords.map((asset) => asset.type)))
        .sort((a, b) => a.localeCompare(b))
        .map((type) => ({ value: type, label: type })),
    [assetRecords],
  );

  const assetOptions = useMemo(
    () =>
      assetRecords.map((asset) => ({
        id: composeAssetKey(asset.namespace, asset.id),
        label: asset.displayName ? `${asset.displayName} (${asset.namespace})` : composeAssetKey(asset.namespace, asset.id),
      })),
    [assetRecords],
  );

  const appOptions = useMemo(
    () =>
      APPS.map((app) => ({
        id: app.id,
        label: app.name,
        description: app.flow,
      })),
    [],
  );

  const flowSelectOptions = useMemo(
    () =>
      FLOWS.map((flow) => ({
        id: flow.id,
        namespace: flow.namespace,
      })),
    [],
  );

  const namespaceFilterValue = useMemo(() => {
    if (["in", "not-in"].includes(namespaceOperator)) {
      if (selectedNamespaces.length === 0) return "Any";
      if (selectedNamespaces.length === 1) return selectedNamespaces[0];
      return `${selectedNamespaces.length} selected`;
    }
    if (!namespaceCustomValue.trim()) return "Any";
    return namespaceCustomValue;
  }, [selectedNamespaces, namespaceOperator, namespaceCustomValue]);

  const flowFilterValue = useMemo(() => {
    if (["contains", "starts-with", "ends-with"].includes(flowOperator)) {
      return flowCustomValue || "Any";
    }
    if (selectedFlows.length === 0) return "Any";
    if (selectedFlows.length === 1) return selectedFlows[0];
    return `${selectedFlows.length} selected`;
  }, [selectedFlows, flowOperator, flowCustomValue]);

  const typeFilterValue = useMemo(() => {
    if (selectedTypes.length === 0) return "Any";
    if (selectedTypes.length === 1) return selectedTypes[0];
    return `${selectedTypes.length} selected`;
  }, [selectedTypes]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes("namespace")) {
      filters.push({
        id: "namespace",
        label: "Namespace",
        value: namespaceFilterValue,
        operator: operatorDisplay[namespaceOperator] ?? namespaceOperator,
      });
    }

    if (visibleFilters.includes("flow")) {
      filters.push({
        id: "flow",
        label: "Flow",
        value: flowFilterValue,
        operator: operatorDisplay[flowOperator] ?? flowOperator,
      });
    }

    if (visibleFilters.includes("type")) {
      filters.push({
        id: "type",
        label: "Type",
        value: typeFilterValue,
        operator: typeOperator === "not-in" ? "not in" : "in",
      });
    }

    return filters;
  }, [
    visibleFilters,
    namespaceFilterValue,
    namespaceOperator,
    flowFilterValue,
    flowOperator,
    typeFilterValue,
    typeOperator,
  ]);

  const handleClearFilter = (filterId: string) => {
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));

    if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "flow") {
      setSelectedFlows([]);
      setFlowOperator("in");
      setFlowCustomValue("");
    } else if (filterId === "type") {
      setSelectedTypes([]);
      setTypeOperator("in");
    }
  };

  const handleEditFilter = () => {
    // Popover handled inside FilterInterface
  };

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedNamespaces([]);
    setNamespaceOperator("in");
    setNamespaceCustomValue("");
    setSelectedFlows([]);
    setFlowOperator("in");
    setFlowCustomValue("");
    setSelectedTypes([]);
    setTypeOperator("in");
    setVisibleFilters([]);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === "namespace") {
      setSelectedNamespaces([]);
      setNamespaceOperator("in");
      setNamespaceCustomValue("");
    } else if (filterId === "flow") {
      setSelectedFlows([]);
      setFlowOperator("in");
      setFlowCustomValue("");
    } else if (filterId === "type") {
      setSelectedTypes([]);
      setTypeOperator("in");
    }
  };

  const getCurrentFilterState = (): SavedFilter["filterState"] => ({
    searchValue,
    selectedStates: [],
    statesOperator: "in",
    selectedInterval: "last-7-days",
    selectedLabels: [],
    labelsOperator: "has-any-of",
    labelsCustomValue: "",
    selectedTags: [],
    tagsOperator: "in",
    tagsCustomValue: "",
    selectedInputs: [],
    inputsOperator: "has-any-of",
    inputsCustomValue: "",
    selectedOutputs: [],
    outputsOperator: "has-any-of",
    outputsCustomValue: "",
    enabledValue: null,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    flowOperator,
    flowCustomValue,
    selectedScopes: [],
    selectedKinds: [],
    selectedHierarchy: "all",
    selectedInitialExecution: "",
    selectedAnnouncementTypes: selectedTypes,
    announcementTypeOperator: typeOperator,
    columnConfig: columns,
    selectedPlugins: [],
    pluginOperator: "in",
    selectedServiceTypes: [],
    serviceTypeOperator: "in",
    selectedBindingTypes: [],
    selectedResources: [],
    resourcesOperator: "in",
    selectedActions: [],
    actionsOperator: "in",
    actorValue: "",
    userValue: "",
    selectedInvitationStatuses: [],
    invitationStatusOperator: "in",
    selectedSuperadminStatuses: [],
    superadminOperator: "in",
    triggerIdOperator: "matches",
    triggerIdValue: "",
  });

  const handleSaveFilter = (name: string, description: string) => {
    const id = `asset-filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };
    assetsSavedFiltersStorage.save(filter);
    setSavedFilters(assetsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? "in");
    setNamespaceCustomValue(state.namespaceCustomValue ?? "");
    setSelectedFlows(state.selectedFlows ?? []);
    setFlowOperator(state.flowOperator ?? "in");
    setFlowCustomValue(state.flowCustomValue ?? "");
    setSelectedTypes(state.selectedAnnouncementTypes ?? []);
    setTypeOperator((state.announcementTypeOperator as "in" | "not-in") ?? "in");
    setColumns(state.columnConfig ?? ASSET_COLUMNS.map((column) => ({ ...column })));

    const required = new Set<string>();
    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? "").trim()) {
      required.add("namespace");
    }
    if ((state.selectedFlows ?? []).length > 0 || (state.flowCustomValue ?? "").trim()) {
      required.add("flow");
    }
    if ((state.selectedAnnouncementTypes ?? []).length > 0) {
      required.add("type");
    }
    setVisibleFilters(Array.from(required));
  };

  const handleDeleteFilter = (filterId: string) => {
    assetsSavedFiltersStorage.delete(filterId);
    setSavedFilters(assetsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    assetsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(assetsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log("Refreshing assets data...");
  };

  return (
    <div className="min-h-screen bg-[#1F232D]">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">Assets</h1>
            <span className="text-sm text-muted-foreground">Track resources created and used by your workflows</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground">Jump to...</button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Ctrl+Cmd+K</span>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <FilterInterface
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilters={activeFilters}
          onClearFilter={handleClearFilter}
          onEditFilter={handleEditFilter}
          onResetFilters={handleResetFilters}
          showChart={false}
          onToggleShowChart={() => {}}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={setPeriodicRefresh}
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          selectedStates={[]}
          statesOperator={"in"}
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedInterval={"last-7-days"}
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={() => {}}
          selectedLabels={[]}
          labelsOperator={"has-any-of"}
          labelsCustomValue={""}
          onLabelsSelectionChange={() => {}}
          onLabelsOperatorChange={() => {}}
          onLabelsCustomValueChange={() => {}}
          selectedInputs={[]}
          inputsOperator={"has-any-of"}
          inputsCustomValue={""}
          onInputsSelectionChange={() => {}}
          onInputsOperatorChange={() => {}}
          onInputsCustomValueChange={() => {}}
          selectedOutputs={[]}
          outputsOperator={"has-any-of"}
          outputsCustomValue={""}
          onOutputsSelectionChange={() => {}}
          onOutputsOperatorChange={() => {}}
          onOutputsCustomValueChange={() => {}}
          selectedNamespaces={selectedNamespaces}
          namespaceOperator={namespaceOperator}
          namespaceCustomValue={namespaceCustomValue}
          onNamespacesSelectionChange={setSelectedNamespaces}
          onNamespaceOperatorChange={setNamespaceOperator}
          onNamespaceCustomValueChange={setNamespaceCustomValue}
          selectedFlows={selectedFlows}
          flowOperator={flowOperator}
          flowCustomValue={flowCustomValue}
          onFlowsSelectionChange={setSelectedFlows}
          onFlowOperatorChange={setFlowOperator}
          onFlowCustomValueChange={setFlowCustomValue}
          selectedTags={[]}
          tagsOperator="in"
          tagsCustomValue=""
          onTagsSelectionChange={() => {}}
          onTagsOperatorChange={() => {}}
          onTagsCustomValueChange={() => {}}
          selectedEnabled={null}
          onEnabledChange={() => {}}
          selectedScopes={[]}
          onScopesSelectionChange={() => {}}
          selectedKinds={[]}
          onKindsSelectionChange={() => {}}
          selectedHierarchy="all"
          onHierarchySelectionChange={() => {}}
          selectedInitialExecution=""
          onInitialExecutionSelectionChange={() => {}}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={ASSET_FILTER_OPTIONS}
          flowOptions={flowOptions}
          namespaceOptions={namespaceOptions}
          announcementTypeOptions={assetTypeOptions}
          selectedAnnouncementTypes={selectedTypes}
          announcementTypeOperator={typeOperator}
          onAnnouncementTypesChange={setSelectedTypes}
          onAnnouncementTypeOperatorChange={setTypeOperator}
          showChartToggleControl={false}
          searchPlaceholder="Search assets..."
        />

        <section className="p-6">
          <AssetsTable rows={tableRows} columns={columns} />
        </section>
      </main>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl bg-[#262A35] border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Create asset</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define the core properties, relationships, and metadata for the new asset.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAsset} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="asset-id">ID *</Label>
                <Input
                  id="asset-id"
                  value={formState.id}
                  onChange={(event) => updateFormField("id", event.target.value)}
                  placeholder="unique_asset_id"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-namespace">Namespace *</Label>
                <Input
                  id="asset-namespace"
                  value={formState.namespace}
                  onChange={(event) => updateFormField("namespace", event.target.value)}
                  placeholder="company.team"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-type">Type *</Label>
                <Input
                  id="asset-type"
                  value={formState.type}
                  onChange={(event) => updateFormField("type", event.target.value)}
                  placeholder="Dataset, VM, Service..."
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-2">
                <Label htmlFor="asset-display-name">Display name</Label>
                <Input
                  id="asset-display-name"
                  value={formState.displayName}
                  onChange={(event) => updateFormField("displayName", event.target.value)}
                  placeholder="Human-readable label"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="asset-emit-events" className="text-sm font-medium text-foreground">
                    Emit events
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Emit events help"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p className="max-w-xs text-xs text-muted-foreground">
                        Toggle to mark this asset for event emission.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex h-10 items-center justify-between rounded-md border border-border/60 bg-[#1F232D] px-3">
                  <span className="text-xs text-muted-foreground">
                    {formState.emitEvents ? "Enabled" : "Disabled"}
                  </span>
                  <Switch
                    id="asset-emit-events"
                    checked={formState.emitEvents}
                    onCheckedChange={(checked) => updateFormField("emitEvents", Boolean(checked))}
                    aria-label="Emit events"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-description">Description</Label>
              <Textarea
                id="asset-description"
                value={formState.description}
                onChange={(event) => updateFormField("description", event.target.value)}
                placeholder="Add context or links. Markdown renders on the overview tab."
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-foreground">Values</Label>
                  <p className="text-xs text-muted-foreground">
                    Keys support dot-notation to create nested structures. Values accept arbitrary strings.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addValuePair}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add field
                </Button>
              </div>
              <div className="space-y-3">
                {valuePairs.map((pair, index) => (
                  <div
                    key={`value-pair-${index}`}
                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Key</Label>
                      <Input
                        value={pair.key}
                        onChange={(event) => handleValuePairChange(index, "key", event.target.value)}
                        placeholder="metadata.owner"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Input
                        value={pair.value}
                        onChange={(event) => handleValuePairChange(index, "value", event.target.value)}
                        placeholder="An arbitrary string"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeValuePair(index)}
                      disabled={valuePairs.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Related resources</Label>
                <p className="text-xs text-muted-foreground">
                  Link existing assets, apps, and flows to capture upstream or downstream relationships.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Assets</span>
                  <Popover open={assetPickerOpen} onOpenChange={setAssetPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between bg-[#1F232D] border-border/60"
                      >
                        <span>
                          {formState.relatedAssets.length > 0
                            ? `${formState.relatedAssets.length} selected`
                            : "Select assets"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-64 p-0 bg-[#1F232D] border-border">
                      <ScrollArea className="max-h-64">
                        {assetOptions.length === 0 ? (
                          <div className="p-3 text-xs text-muted-foreground">No assets available.</div>
                        ) : (
                          assetOptions.map((option) => {
                            const checked = formState.relatedAssets.includes(option.id);
                            return (
                              <label
                                key={option.id}
                                className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-[#32384A]"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => handleAssetToggle(option.id)}
                                />
                                <span className="text-sm text-foreground">{option.label}</span>
                              </label>
                            );
                          })
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {formState.relatedAssets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formState.relatedAssets.map((assetId) => {
                        const option = assetOptions.find((item) => item.id === assetId);
                        return (
                          <Badge key={assetId} variant="outline" className="text-xs">
                            {option?.label ?? assetId}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Apps</span>
                  <Popover open={appPickerOpen} onOpenChange={setAppPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between bg-[#1F232D] border-border/60"
                      >
                        <span>
                          {formState.relatedApps.length > 0
                            ? `${formState.relatedApps.length} selected`
                            : "Select apps"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-72 p-0 bg-[#1F232D] border-border">
                      <ScrollArea className="max-h-64">
                        {appOptions.map((option) => {
                          const checked = formState.relatedApps.includes(option.id);
                          return (
                            <label
                              key={option.id}
                              className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-[#32384A]"
                            >
                              <Checkbox checked={checked} onCheckedChange={() => handleAppToggle(option.id)} />
                              <div className="flex flex-col">
                                <span className="text-sm text-foreground">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.description}</span>
                              </div>
                            </label>
                          );
                        })}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {formState.relatedApps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formState.relatedApps.map((appId) => {
                        const option = appOptions.find((item) => item.id === appId);
                        return (
                          <Badge key={appId} variant="outline" className="text-xs">
                            {option?.label ?? appId}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Flows</span>
                  <Popover open={flowPickerOpen} onOpenChange={setFlowPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between bg-[#1F232D] border-border/60"
                      >
                        <span>
                          {formState.relatedFlows.length > 0
                            ? `${formState.relatedFlows.length} selected`
                            : "Select flows"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-72 p-0 bg-[#1F232D] border-border">
                      <ScrollArea className="max-h-64">
                        {flowSelectOptions.map((option) => {
                          const checked = formState.relatedFlows.includes(option.id);
                          return (
                            <label
                              key={option.id}
                              className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-[#32384A]"
                            >
                              <Checkbox checked={checked} onCheckedChange={() => handleFlowToggle(option.id)} />
                              <div className="flex flex-col">
                                <span className="text-sm text-foreground">{option.id}</span>
                                <span className="text-xs text-muted-foreground">{option.namespace ?? "—"}</span>
                              </div>
                            </label>
                          );
                        })}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {formState.relatedFlows.length > 0 && (
                    <div className="space-y-1.5">
                      {formState.relatedFlows.map((flowId) => {
                        const option = flowSelectOptions.find((item) => item.id === flowId);
                        return (
                          <div key={flowId} className="inline-flex">
                            <Badge variant="outline" className="text-xs">
                              {option?.namespace ? `${option.namespace}/${flowId}` : flowId}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setCreateDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#8408FF] hover:bg-[#8613f7]">
                Save asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
