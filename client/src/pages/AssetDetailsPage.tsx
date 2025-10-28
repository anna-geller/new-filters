import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AssetFlowLink } from "@/types/assets";
import ExecutionsPage from "@/pages/ExecutionsPage";
import { ArrowLeft, Info, Link2, MoreVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  deleteCustomAsset,
  getAllAssets,
  isCustomAsset,
  subscribeToAssetChanges,
  upsertCustomAsset,
} from "@/utils/assetCatalog";
import type { AssetRecord } from "@/types/assets";
import { composeAssetKey, parseAssetKey } from "@/utils/assetKeys";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { DetailFilter } from "@/types/auditLogs";
import type { ColumnConfig, SavedFilter } from "@/types/savedFilters";
import type { FlowOption } from "@/components/FlowFilterEditor";
import { APPS } from "@/data/apps";
import { FLOWS } from "@/data/flows";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AssetDetailsPageProps {
  params?: {
    namespace?: string;
    assetId?: string;
  };
}

interface DependencyDisplayItem {
  id: string;
  label: string;
  category: "Asset" | "App" | "Flow";
  detail?: string;
  href?: string;
  namespace?: string;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEPENDENCY_FILTER_OPTIONS: FilterOption[] = [
  { id: "dependency-assets", label: "Related assets", description: "Filter related assets", enabled: false, order: 1 },
  { id: "flow", label: "Related flows", description: "Filter related flows", enabled: false, order: 2 },
  { id: "dependency-apps", label: "Related apps", description: "Filter related apps", enabled: false, order: 3 },
];

const DEPENDENCY_COLUMNS: ColumnConfig[] = [
  { id: "label", label: "Name", description: "Dependency identifier", visible: true, order: 1 },
  { id: "category", label: "Category", description: "Asset, app, or flow classification", visible: true, order: 2 },
  { id: "namespace", label: "Namespace", description: "Owning namespace when available", visible: true, order: 3 },
  { id: "detail", label: "Detail", description: "Extra context such as type or scope", visible: true, order: 4 },
];

const ensureLabelColumnVisible = (columns: ColumnConfig[]): ColumnConfig[] =>
  columns.map((column) =>
    column.id === "label" ? { ...column, visible: true } : column,
  );

type ValuePair = { key: string; value: string };

interface AssetEditorState {
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

const EMPTY_EDITOR_STATE: AssetEditorState = {
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

const CHIP_COLORS = {
  asset: {
    fill: "#2563eb",
    border: "border-blue-500/40",
    badge: "bg-blue-500/10 text-blue-100 border-blue-500/40",
  },
  app: {
    fill: "#10b981",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-100 border-emerald-500/40",
  },
  flow: {
    fill: "#8b5cf6",
    border: "border-purple-500/40",
    badge: "bg-purple-500/10 text-purple-100 border-purple-500/40",
  },
  primary: {
    fill: "#5b21b6",
    border: "border-primary/60",
    badge: "bg-primary/15 text-primary-100 border-primary/60",
  },
} as const;

function formatToken(token: string): string {
  return token
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function AssetDetailsPage({ params }: AssetDetailsPageProps) {
  const namespaceParam = params?.namespace ?? "";
  const assetIdParam = params?.assetId ?? "";
  const requestedAssetKey =
    namespaceParam && assetIdParam ? composeAssetKey(namespaceParam, assetIdParam) : "";
  const [allAssets, setAllAssets] = useState<AssetRecord[]>(() => getAllAssets());
  const assetMap = useMemo(() => {
    const map = new Map<string, AssetRecord>();
    allAssets.forEach((record) => {
      map.set(composeAssetKey(record.namespace, record.id), record);
    });
    return map;
  }, [allAssets]);

  const asset = useMemo(() => {
    if (requestedAssetKey) {
      const match = assetMap.get(requestedAssetKey);
      if (match) {
        return match;
      }
    }

    if (assetIdParam) {
      return allAssets.find((record) => record.id === assetIdParam);
    }

    return undefined;
  }, [requestedAssetKey, assetMap, assetIdParam, allAssets]);
  const [activeTab, setActiveTab] = useState("overview");
  const [dependencySearch, setDependencySearch] = useState("");
  const [assetDependencyFilters, setAssetDependencyFilters] = useState<DetailFilter[]>([]);
  const [appDependencyFilters, setAppDependencyFilters] = useState<DetailFilter[]>([]);
  const [dependencyVisibleFilters, setDependencyVisibleFilters] = useState<string[]>([]);
  const [dependencySavedFilters, setDependencySavedFilters] = useState<SavedFilter[]>([]);
  const [dependencyColumns, setDependencyColumns] = useState<ColumnConfig[]>(() =>
    DEPENDENCY_COLUMNS.map((column) => ({ ...column })),
  );
  const [dependencyPeriodicRefresh, setDependencyPeriodicRefresh] = useState(false);
  const [dependencySelectedFlows, setDependencySelectedFlows] = useState<string[]>([]);
  const [dependencyFlowOperator, setDependencyFlowOperator] = useState<string>("in");
  const [dependencyFlowCustomValue, setDependencyFlowCustomValue] = useState<string>("");
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormState, setEditFormState] = useState<AssetEditorState>(() => ({ ...EMPTY_EDITOR_STATE }));
  const [editValuePairs, setEditValuePairs] = useState<ValuePair[]>([{ key: "", value: "" }]);
  const [editAssetPickerOpen, setEditAssetPickerOpen] = useState(false);
  const [editAppPickerOpen, setEditAppPickerOpen] = useState(false);
  const [editFlowPickerOpen, setEditFlowPickerOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (!asset) {
    return (
      <div className="min-h-screen bg-[#1F232D] text-foreground flex items-center justify-center px-6">
        <Card className="max-w-lg p-8 space-y-4 bg-[#262A35] border-border">
          <div className="text-lg font-semibold">Asset not found</div>
          <p className="text-sm text-muted-foreground">
            We couldn’t locate that asset. It may have been removed or the identifier could be incorrect.
          </p>
          <Link href="/assets" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Assets
          </Link>
        </Card>
      </div>
    );
  }

  const assetLabel = asset.displayName ?? asset.id;
  const assetIsCustom = isCustomAsset(asset.namespace, asset.id);
  const assetCompositeKey = composeAssetKey(asset.namespace, asset.id);

  useEffect(() => {
    const unsubscribe = subscribeToAssetChanges(() => {
      setAllAssets(getAllAssets());
    });

    return unsubscribe;
  }, []);

  const formatValueContent = (value: unknown): { content: string; multiline: boolean } => {
    if (value === null || typeof value === "undefined") {
      return { content: "—", multiline: false };
    }

    if (typeof value === "string") {
      return { content: value, multiline: value.includes("\n") };
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return { content: String(value), multiline: false };
    }

    const serialized = JSON.stringify(value, null, 2);
    return { content: serialized, multiline: true };
  };

  const toggleSelection = (collection: string[], value: string) =>
    collection.includes(value) ? collection.filter((item) => item !== value) : [...collection, value];

  const buildValuesObjectFromPairs = (pairs: ValuePair[]): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    pairs.forEach(({ key, value }) => {
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

  const flattenAssetValues = (values: unknown, prefix = ""): ValuePair[] => {
    if (values === null || typeof values !== "object") {
      return [];
    }

    return Object.entries(values as Record<string, unknown>).flatMap(([key, rawValue]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (rawValue !== null && typeof rawValue === "object" && !Array.isArray(rawValue)) {
        return flattenAssetValues(rawValue, path);
      }

      if (typeof rawValue === "string") {
        return [{ key: path, value: rawValue }];
      }

      try {
        return [{ key: path, value: JSON.stringify(rawValue) }];
      } catch {
        return [{ key: path, value: String(rawValue) }];
      }
    });
  };

  const convertAssetToFormState = (record: AssetRecord): AssetEditorState => ({
    id: record.id,
    type: record.type,
    namespace: record.namespace,
    displayName: record.displayName ?? "",
    description: record.description ?? "",
    emitEvents: Boolean(record.emitEvents),
    relatedAssets: record.relatedAssets ?? [],
    relatedApps: record.relatedApps ?? [],
    relatedFlows: (record.relatedFlows ?? []).map((flow) => flow.flow),
  });

  const resetEditForm = () => {
    setEditFormState({ ...EMPTY_EDITOR_STATE });
    setEditValuePairs([{ key: "", value: "" }]);
    setEditAssetPickerOpen(false);
    setEditAppPickerOpen(false);
    setEditFlowPickerOpen(false);
  };

  const handleEditAssetToggle = (assetKey: string) => {
    setEditFormState((previous) => ({
      ...previous,
      relatedAssets: toggleSelection(previous.relatedAssets, assetKey),
    }));
  };

  const handleEditAppToggle = (appId: string) => {
    setEditFormState((previous) => ({
      ...previous,
      relatedApps: toggleSelection(previous.relatedApps, appId),
    }));
  };

  const handleEditFlowToggle = (flowId: string) => {
    setEditFormState((previous) => ({
      ...previous,
      relatedFlows: toggleSelection(previous.relatedFlows, flowId),
    }));
  };

  const handleEditValuePairChange = (index: number, field: "key" | "value", nextValue: string) => {
    setEditValuePairs((previous) =>
      previous.map((pair, pairIndex) => (pairIndex === index ? { ...pair, [field]: nextValue } : pair)),
    );
  };

  const addEditValuePair = () => {
    setEditValuePairs((previous) => [...previous, { key: "", value: "" }]);
  };

  const removeEditValuePair = (index: number) => {
    setEditValuePairs((previous) => {
      const next = previous.filter((_, pairIndex) => pairIndex !== index);
      return next.length > 0 ? next : [{ key: "", value: "" }];
    });
  };

  const handleEditAssetChange = <Key extends keyof AssetEditorState>(field: Key, value: AssetEditorState[Key]) => {
    setEditFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleDeleteAsset = () => {
    if (!asset) {
      return;
    }

    if (!isCustomAsset(asset.namespace, asset.id)) {
      toast({
        title: "Protected asset",
        description: "System assets cannot be deleted from the UI.",
        variant: "destructive",
      });
      return;
    }

    deleteCustomAsset(asset.namespace, asset.id);
    toast({
      title: "Asset deleted",
      description: `${asset.displayName ?? asset.id} was removed.`,
    });
    setLocation("/assets");
  };

  const handleEditAsset = () => {
    const initialForm = convertAssetToFormState(asset);
    setEditFormState(initialForm);
    const flattenedValues = flattenAssetValues(asset.values);
    setEditValuePairs(flattenedValues.length > 0 ? flattenedValues : [{ key: "", value: "" }]);
    setEditAssetPickerOpen(false);
    setEditAppPickerOpen(false);
    setEditFlowPickerOpen(false);
    setEditDialogOpen(true);
  };

  const normalizeFilterKey = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, "");

  const matchesDetailFilters = (item: DependencyDisplayItem, filters: DetailFilter[]): boolean => {
    if (!filters || filters.length === 0) {
      return true;
    }

    const normalizedFilters = filters
      .map((pair) => ({
        key: normalizeFilterKey(pair.key),
        value: pair.value.trim().toLowerCase(),
      }))
      .filter((pair) => pair.key && pair.value);

    if (normalizedFilters.length === 0) {
      return true;
    }

    const valueMap = new Map<string, string>();
    const setValue = (key: string, rawValue?: string) => {
      if (!rawValue) {
        return;
      }
      valueMap.set(normalizeFilterKey(key), rawValue.trim().toLowerCase());
    };

    setValue("id", item.id);
    setValue("key", item.id);
    setValue("label", item.label);
    setValue("detail", item.detail ?? "");
    setValue("category", item.category);
    setValue("namespace", item.namespace ?? "");

    if (item.category === "Asset") {
      const { namespace, id } = parseAssetKey(item.id);
      setValue("assetid", id);
      setValue("assetnamespace", namespace);
      setValue("type", item.detail ?? "");
    }

    if (item.category === "Flow") {
      setValue("flow", item.id);
      setValue("flownamespace", item.namespace ?? "");
    }

    if (item.category === "App") {
      setValue("app", item.id);
    }

    return normalizedFilters.every(({ key, value }) => {
      const candidate = valueMap.get(key);
      if (!candidate) {
        return false;
      }
      return candidate.includes(value);
    });
  };

  const formatFilterSummary = (filters: DetailFilter[]) =>
    filters.map((pair) => `${pair.key}=${pair.value}`).join(", ");

  const getCurrentDependencyFilterState = (): SavedFilter["filterState"] => ({
    searchValue: dependencySearch,
    selectedStates: [],
    statesOperator: "in",
    selectedInterval: "last-7-days",
    selectedLabels: [],
    labelsOperator: "has-any-of",
    labelsCustomValue: "",
    selectedNamespaces: [],
    selectedFlows: dependencySelectedFlows,
    flowOperator: dependencyFlowOperator,
    flowCustomValue: dependencyFlowCustomValue,
    selectedScopes: [],
    selectedKinds: [],
    selectedHierarchy: "all",
    selectedInitialExecution: "",
    detailsFilters: [],
    visibleFilters: dependencyVisibleFilters,
    columnConfig: dependencyColumns,
    dependencyAssetFilters: assetDependencyFilters,
    dependencyAppFilters: appDependencyFilters,
  });

  const removeDependencyVisibleFilter = (filterId: string) => {
    setDependencyVisibleFilters((previous) => previous.filter((id) => id !== filterId));
  };

  const handleDependencyClearFilter = (filterId: string) => {
    if (filterId === "dependency-assets") {
      setAssetDependencyFilters([]);
      removeDependencyVisibleFilter("dependency-assets");
    } else if (filterId === "flow") {
      setDependencySelectedFlows([]);
      setDependencyFlowOperator("in");
      setDependencyFlowCustomValue("");
      removeDependencyVisibleFilter("flow");
    } else if (filterId === "dependency-apps") {
      setAppDependencyFilters([]);
      removeDependencyVisibleFilter("dependency-apps");
    }
  };

  const handleDependencyResetFilters = () => {
    setDependencySearch("");
    setAssetDependencyFilters([]);
    setAppDependencyFilters([]);
    setDependencySelectedFlows([]);
    setDependencyFlowOperator("in");
    setDependencyFlowCustomValue("");
    setDependencyVisibleFilters([]);
    setDependencyColumns(ensureLabelColumnVisible(DEPENDENCY_COLUMNS.map((column) => ({ ...column }))));
  };

  const handleDependencyResetFilter = (filterId: string) => {
    if (filterId === "dependency-assets") {
      setAssetDependencyFilters([]);
    } else if (filterId === "flow") {
      setDependencySelectedFlows([]);
      setDependencyFlowOperator("in");
      setDependencyFlowCustomValue("");
    } else if (filterId === "dependency-apps") {
      setAppDependencyFilters([]);
    }
  };

  const handleDependencySaveFilter = (name: string, description: string) => {
    const id = `dependency-filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentDependencyFilterState(),
    };
    setDependencySavedFilters((previous) => [...previous, filter]);
  };

  const handleDependencyLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setDependencySearch(state.searchValue ?? "");
    setAssetDependencyFilters(state.dependencyAssetFilters ?? []);
    setAppDependencyFilters(state.dependencyAppFilters ?? []);
    setDependencySelectedFlows(state.selectedFlows ?? []);
    setDependencyFlowOperator(state.flowOperator ?? "in");
    setDependencyFlowCustomValue(state.flowCustomValue ?? "");
    setDependencyVisibleFilters(state.visibleFilters ?? []);
    const columnsFromState = state.columnConfig ?? DEPENDENCY_COLUMNS.map((column) => ({ ...column }));
    setDependencyColumns(ensureLabelColumnVisible(columnsFromState));
  };

  const handleDependencyDeleteFilter = (filterId: string) => {
    setDependencySavedFilters((previous) => previous.filter((filter) => filter.id !== filterId));
  };

  const handleDependencyUpdateFilter = (filterId: string, name: string, description: string) => {
    const now = new Date().toISOString();
    setDependencySavedFilters((previous) =>
      previous.map((filter) =>
        filter.id === filterId
          ? {
              ...filter,
              name,
              description,
              updatedAt: now,
            }
          : filter,
      ),
    );
  };

  const handleDependencyColumnsChange = (columns: ColumnConfig[]) => {
    setDependencyColumns(ensureLabelColumnVisible(columns));
  };

  const handleDependencyRefresh = () => {};

  const handleSubmitEditAsset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedId = editFormState.id.trim();
    const trimmedType = editFormState.type.trim();
    const trimmedNamespace = editFormState.namespace.trim();
    const trimmedDescription = editFormState.description.trim();

    if (!trimmedId || !trimmedType || !trimmedNamespace) {
      toast({
        title: "Missing information",
        description: "ID, type, and namespace are required to update an asset.",
        variant: "destructive",
      });
      return;
    }

    const originalKey = composeAssetKey(asset.namespace, asset.id);
    const nextKey = composeAssetKey(trimmedNamespace, trimmedId);

    const duplicate = allAssets.some((record) => {
      const candidateKey = composeAssetKey(record.namespace, record.id);
      return candidateKey === nextKey && candidateKey !== originalKey;
    });

    if (duplicate) {
      toast({
        title: "Asset already exists",
        description: `Another asset already uses ${trimmedNamespace}/${trimmedId}. Choose a different identifier.`,
        variant: "destructive",
      });
      return;
    }

    if (!assetIsCustom && nextKey !== originalKey) {
      toast({
        title: "Namespace locked",
        description: "System assets cannot change their ID or namespace.",
        variant: "destructive",
      });
      return;
    }

    const valuesObject = buildValuesObjectFromPairs(editValuePairs);
    const hasValues = Object.keys(valuesObject).length > 0;
    const normalizedRelatedAssets = editFormState.relatedAssets.map((value) => value.trim()).filter(Boolean);
    const normalizedRelatedApps = editFormState.relatedApps.map((value) => value.trim()).filter(Boolean);

    const selectedFlows: AssetFlowLink[] = editFormState.relatedFlows
      .map((flowId) => {
        if (!flowId) {
          return null;
        }
        const knownFlow = flowSelectOptions.find((option) => option.id === flowId);
        if (knownFlow) {
          return {
            flow: knownFlow.id,
            namespace: knownFlow.namespace,
          };
        }
        const existing = (asset.relatedFlows ?? []).find((flow) => flow.flow === flowId);
        if (existing) {
          return {
            flow: existing.flow,
            namespace: existing.namespace,
          };
        }
        return {
          flow: flowId,
        };
      })
      .filter(Boolean) as AssetFlowLink[];

    if (assetIsCustom && nextKey !== originalKey) {
      deleteCustomAsset(asset.namespace, asset.id);
    }

    const updatedAsset: AssetRecord = {
      ...asset,
      id: trimmedId,
      type: trimmedType,
      namespace: trimmedNamespace,
      displayName: editFormState.displayName.trim() || undefined,
      description: trimmedDescription || undefined,
      emitEvents: editFormState.emitEvents,
      relatedAssets: normalizedRelatedAssets,
      relatedApps: normalizedRelatedApps,
      relatedFlows: selectedFlows,
      values: hasValues ? valuesObject : undefined,
    };

    upsertCustomAsset(updatedAsset);
    setAllAssets(getAllAssets());
    toast({
      title: "Asset updated",
      description: `${trimmedNamespace}/${trimmedId} was saved.`,
    });
    setEditDialogOpen(false);
    resetEditForm();

    if (nextKey !== originalKey) {
      const nextPath = trimmedNamespace ? `/assets/${trimmedNamespace}/${trimmedId}` : `/assets/${trimmedId}`;
      setLocation(nextPath);
    }
  };

  const relatedAssetItems = useMemo(
    () =>
      (asset.relatedAssets ?? []).map((reference) => {
        const trimmedReference = reference.trim();
        const hasNamespace = trimmedReference.includes("/");
        let namespace: string | undefined;
        let assetId = trimmedReference;

        if (hasNamespace) {
          const { namespace: parsedNamespace, id } = parseAssetKey(trimmedReference);
          namespace = parsedNamespace;
          assetId = id || assetId;
        }

        let lookupKey = namespace && assetId ? composeAssetKey(namespace, assetId) : trimmedReference;
        let relatedAsset = lookupKey ? assetMap.get(lookupKey) : undefined;

        if (!relatedAsset && !hasNamespace) {
          relatedAsset = allAssets.find((record) => record.id === assetId);
          if (relatedAsset) {
            namespace = relatedAsset.namespace;
            assetId = relatedAsset.id;
            lookupKey = composeAssetKey(namespace, assetId);
          }
        }

        const label = relatedAsset?.displayName ?? assetId;
        const href = namespace && assetId ? `/assets/${namespace}/${assetId}` : undefined;

        return {
          id: lookupKey,
          label,
          category: "Asset" as const,
          detail: relatedAsset?.type ?? "Asset",
          href,
          namespace,
        };
      }),
    [asset.relatedAssets, assetMap, allAssets],
  );

  const relatedAppItems = useMemo(
    () =>
      (asset.relatedApps ?? []).map((appId) => ({
        id: appId,
        label: formatToken(appId),
        category: "App" as const,
        detail: appId,
        href: `/apps?search=${encodeURIComponent(appId)}`,
      })),
    [asset.relatedApps],
  );

  const relatedFlowItems = useMemo(
    () =>
      (asset.relatedFlows ?? []).map((flow: AssetFlowLink) => {
        const namespace = flow.namespace ?? "";
        return {
          id: flow.flow,
          label: flow.flow,
          category: "Flow" as const,
          detail: namespace || undefined,
          namespace,
          href: namespace
            ? `/flows?namespace=${encodeURIComponent(namespace)}&flow=${encodeURIComponent(flow.flow)}`
            : `/flows?flow=${encodeURIComponent(flow.flow)}`,
        };
      }),
    [asset.relatedFlows],
  );

  const assetOptions = useMemo(
    () =>
      allAssets
        .filter((record) => composeAssetKey(record.namespace, record.id) !== assetCompositeKey)
        .map((record) => ({
          id: composeAssetKey(record.namespace, record.id),
          label: record.displayName ? `${record.displayName} (${record.namespace})` : composeAssetKey(record.namespace, record.id),
        })),
    [allAssets, assetCompositeKey],
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

  const flowSelectOptions = useMemo(() => {
    const options = new Map<string, { id: string; namespace?: string }>();
    FLOWS.forEach((flow) => {
      options.set(flow.id, { id: flow.id, namespace: flow.namespace });
    });
    (asset.relatedFlows ?? []).forEach((flow) => {
      if (!options.has(flow.flow)) {
        options.set(flow.flow, { id: flow.flow, namespace: flow.namespace });
      }
    });
    return Array.from(options.values());
  }, [asset.relatedFlows]);

  const dependencyFlowOptions = useMemo<FlowOption[]>(() => {
    const entries = new Map<string, FlowOption>();
    flowSelectOptions.forEach((option) => {
      const description = option.namespace ? `Namespace: ${option.namespace}` : "Related flow";
      entries.set(option.id, { id: option.id, label: option.id, description });
    });
    relatedFlowItems.forEach((item) => {
      const description = item.namespace ? `Namespace: ${item.namespace}` : "Related flow";
      if (entries.has(item.id)) {
        entries.set(item.id, { ...entries.get(item.id)!, label: item.label, description });
      } else {
        entries.set(item.id, { id: item.id, label: item.label, description });
      }
    });
    return Array.from(entries.values());
  }, [flowSelectOptions, relatedFlowItems]);

  const dependencyFlowFilterValue = useMemo(() => {
    if (dependencyFlowOperator === "contains" || dependencyFlowOperator === "starts-with" || dependencyFlowOperator === "ends-with") {
      return dependencyFlowCustomValue.trim() || "Any";
    }
    if (dependencySelectedFlows.length === 0) {
      return "Any";
    }
    if (dependencySelectedFlows.length === 1) {
      const option = dependencyFlowOptions.find((candidate) => candidate.id === dependencySelectedFlows[0]);
      return option?.label ?? dependencySelectedFlows[0];
    }
    return `${dependencySelectedFlows.length} selected`;
  }, [dependencySelectedFlows, dependencyFlowOperator, dependencyFlowCustomValue, dependencyFlowOptions]);

  const dependencyFlowFilterActive = useMemo(() => {
    if (!dependencyVisibleFilters.includes("flow")) {
      return false;
    }
    if (dependencyFlowOperator === "contains" || dependencyFlowOperator === "starts-with" || dependencyFlowOperator === "ends-with") {
      return dependencyFlowCustomValue.trim().length > 0;
    }
    return dependencySelectedFlows.length > 0;
  }, [dependencyVisibleFilters, dependencyFlowOperator, dependencyFlowCustomValue, dependencySelectedFlows]);

  const dependencyActiveFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (assetDependencyFilters.length > 0) {
      filters.push({
        id: "dependency-assets",
        label: "Related assets",
        value: formatFilterSummary(assetDependencyFilters),
        operator: assetDependencyFilters.length > 1 ? "matches all" : "matches",
      });
    }
    if (dependencyFlowFilterActive) {
      const operatorLabel =
        dependencyFlowOperator === "in"
          ? "in"
          : dependencyFlowOperator === "not-in"
            ? "not in"
            : dependencyFlowOperator;
      filters.push({
        id: "flow",
        label: "Related flows",
        value: dependencyFlowFilterValue,
        operator: operatorLabel,
      });
    }
    if (appDependencyFilters.length > 0) {
      filters.push({
        id: "dependency-apps",
        label: "Related apps",
        value: formatFilterSummary(appDependencyFilters),
        operator: appDependencyFilters.length > 1 ? "matches all" : "matches",
      });
    }
    return filters;
  }, [
    assetDependencyFilters,
    appDependencyFilters,
    dependencyFlowFilterActive,
    dependencyFlowOperator,
    dependencyFlowFilterValue,
  ]);

  const hasRelatedDependencies =
    (asset.relatedAssets?.length ?? 0) > 0 ||
    (asset.relatedApps?.length ?? 0) > 0 ||
    (asset.relatedFlows?.length ?? 0) > 0;

  const dependencyRows = useMemo<DependencyDisplayItem[]>(
    () => [
      {
        id: assetCompositeKey,
        label: assetLabel,
        category: "Asset",
        detail: asset.type,
        namespace: asset.namespace,
      },
      ...relatedAssetItems,
      ...relatedAppItems,
      ...relatedFlowItems,
    ],
    [assetCompositeKey, asset.namespace, asset.type, assetLabel, relatedAssetItems, relatedAppItems, relatedFlowItems],
  );

  const filteredDependencies = useMemo(() => {
    const query = dependencySearch.trim().toLowerCase();
    const assetFiltersEnabled =
      dependencyVisibleFilters.includes("dependency-assets") && assetDependencyFilters.length > 0;
    const flowFiltersEnabled = dependencyFlowFilterActive;
    const appFiltersEnabled =
      dependencyVisibleFilters.includes("dependency-apps") && appDependencyFilters.length > 0;
    const categoryFilterActive = assetFiltersEnabled || flowFiltersEnabled || appFiltersEnabled;

    const matchesFlowFilter = (flowItem: DependencyDisplayItem) => {
      if (!flowFiltersEnabled) {
        return true;
      }

      if (dependencyFlowOperator === "in") {
        return dependencySelectedFlows.includes(flowItem.id);
      }

      if (dependencyFlowOperator === "not-in") {
        return !dependencySelectedFlows.includes(flowItem.id);
      }

      const needle = dependencyFlowCustomValue.trim().toLowerCase();
      if (!needle) {
        return true;
      }

      const label = (flowItem.label ?? flowItem.id).toLowerCase();
      const identifier = flowItem.id.toLowerCase();
      const namespace = (flowItem.namespace ?? "").toLowerCase();

      if (dependencyFlowOperator === "contains") {
        return label.includes(needle) || identifier.includes(needle) || namespace.includes(needle);
      }

      if (dependencyFlowOperator === "starts-with") {
        return label.startsWith(needle) || identifier.startsWith(needle);
      }

      if (dependencyFlowOperator === "ends-with") {
        return label.endsWith(needle) || identifier.endsWith(needle);
      }

      return true;
    };

    return dependencyRows.filter((item) => {
      if (query) {
        const haystack = [item.label, item.detail ?? "", item.id, item.category, item.namespace ?? ""].join(" ").toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (categoryFilterActive) {
        const keepCategory =
          (item.category === "Asset" && assetFiltersEnabled) ||
          (item.category === "Flow" && flowFiltersEnabled) ||
          (item.category === "App" && appFiltersEnabled);

        if (!keepCategory) {
          return false;
        }
      }

      if (item.category === "Asset" && assetFiltersEnabled && !matchesDetailFilters(item, assetDependencyFilters)) {
        return false;
      }

      if (item.category === "Flow" && flowFiltersEnabled && !matchesFlowFilter(item)) {
        return false;
      }

      if (item.category === "App" && appFiltersEnabled && !matchesDetailFilters(item, appDependencyFilters)) {
        return false;
      }

      return true;
    });
  }, [
    dependencyRows,
    dependencySearch,
    assetDependencyFilters,
    appDependencyFilters,
    dependencyVisibleFilters,
    dependencyFlowFilterActive,
    dependencyFlowOperator,
    dependencyFlowCustomValue,
    dependencySelectedFlows,
  ]);

  const dependencyColumnVisibility = useMemo(
    () => ({
      category: dependencyColumns.some((column) => column.id === "category" && column.visible),
      namespace: dependencyColumns.some((column) => column.id === "namespace" && column.visible),
      detail: dependencyColumns.some((column) => column.id === "detail" && column.visible),
    }),
    [dependencyColumns],
  );

  const legendItems = [
    { label: "Asset", color: CHIP_COLORS.asset.fill },
    { label: "App", color: CHIP_COLORS.app.fill },
    { label: "Flow", color: CHIP_COLORS.flow.fill },
  ];

  const [selectedNodeId, setSelectedNodeId] = useState<string>(assetCompositeKey);

  const graphNodes = useMemo(() => {
    const minSpacing = 56;
    const baseWidth = 680;
    const baseHeight = 480;
    const maxNodeCount = Math.max(
      relatedAssetItems.length,
      relatedFlowItems.length,
      relatedAppItems.length,
    );
    const height = Math.max(baseHeight, 220 + (maxNodeCount + 1) * minSpacing);
    const width = baseWidth;
    const center = { x: width / 2, y: height / 2 };

    const distribute = (count: number, span: number, padding: number) => {
      if (count <= 0) {
        return [];
      }
      return Array.from({ length: count }, (_, index) => {
        const step = span / (count + 1);
        return padding + step * (index + 1);
      });
    };

    const verticalSpan = height - 160;
    const assetYPositions = distribute(relatedAssetItems.length, verticalSpan, 80);
    const flowYPositions = distribute(relatedFlowItems.length, verticalSpan, 80);
    const appXPositions = distribute(relatedAppItems.length, width - 200, 100);
    const appRowY = height - 90;

    const nodeEntries: Array<{
      id: string;
      label: string;
      type: "asset" | "app" | "flow" | "primary";
      x: number;
      y: number;
      namespace?: string;
    }> = [
      {
        id: assetCompositeKey,
        label: assetLabel,
        type: "primary",
        x: center.x,
        y: center.y,
        namespace: asset.namespace,
      },
      ...relatedAssetItems.map((item, index) => ({
        id: item.id,
        label: item.label,
        type: "asset" as const,
        namespace: item.namespace,
        x: width * 0.18,
        y: assetYPositions[index] ?? center.y,
      })),
      ...relatedFlowItems.map((item, index) => ({
        id: item.id,
        label: item.label,
        type: "flow" as const,
        namespace: item.namespace,
        x: width * 0.82,
        y: flowYPositions[index] ?? center.y,
      })),
      ...relatedAppItems.map((item, index) => ({
        id: item.id,
        label: item.label,
        type: "app" as const,
        x: appXPositions[index] ?? center.x,
        y: appRowY,
      })),
    ];

    return { nodes: nodeEntries, size: { width, height }, center };
  }, [assetCompositeKey, assetLabel, relatedAssetItems, relatedFlowItems, relatedAppItems]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  useEffect(() => {
    if (!filteredDependencies.some((item) => item.id === selectedNodeId)) {
      const fallback = filteredDependencies[0]?.id ?? assetCompositeKey;
      setSelectedNodeId(fallback);
    }
  }, [filteredDependencies, selectedNodeId, assetCompositeKey]);

  const mainPaddingClass =
    activeTab === "executions"
      ? "pt-0 pb-6"
      : activeTab === "dependencies"
        ? "pt-2 pb-6"
        : "py-6";

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="min-h-screen bg-[#1F232D] text-foreground"
    >
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-[#262A35]">
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-xs tracking-wide text-muted-foreground flex items-center gap-1">
                  <Link href="/assets" className="transition-colors hover:text-foreground">
                    Assets
                  </Link>
                  <span>/</span>
                  <span className="font-mono text-muted-foreground">{asset.namespace}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-foreground">{assetLabel}</h1>
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide bg-[#32384A] text-foreground">
                    {asset.type}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-border/60 bg-[#1F232D] hover:bg-[#262A35]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-[#2F3341] border-border/60">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleDeleteAsset();
                      }}
                      className="text-destructive focus:bg-destructive/10"
                    >
                      Delete asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="default"
                  onClick={handleEditAsset}
                  className="bg-[#8408FF] hover:bg-[#8613f7]"
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-px w-full bg-border/60" />
              <TabsList className="flex justify-start gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="executions"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]"
                >
                  Executions
                </TabsTrigger>
                <TabsTrigger
                  value="dependencies"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]"
                >
                  Dependencies
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto px-6 space-y-6 ${mainPaddingClass}`}>
          <TabsContent value="overview" className="space-y-6">
            {asset.description ? (
              <Card className="p-6 bg-[#262A35] border-border">
                <div className="text-sm font-semibold mb-4">Description</div>
                <MarkdownRenderer content={asset.description} />
              </Card>
            ) : null}

            <Card className="p-6 bg-[#262A35] border-border">
              <div className="text-sm font-semibold mb-4">Asset values</div>
              {asset.values && Object.keys(asset.values).length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(asset.values).map(([key, value]) => {
                    const formatted = formatValueContent(value);
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{formatToken(key)}</span>
                        {formatted.multiline ? (
                          <pre className="text-xs md:text-sm text-foreground/90 bg-[#1A1E29] border border-border/40 rounded-md p-2 whitespace-pre-wrap break-words">
                            {formatted.content}
                          </pre>
                        ) : (
                          <span className="text-sm text-foreground break-words">{formatted.content}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No values captured for this asset yet.</p>
              )}
            </Card>

            <Card className="p-6 bg-[#262A35] border-border">
              <div className="text-sm font-semibold mb-4">Related resources</div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Assets</div>
                  <div className="flex flex-col gap-2">
                    {relatedAssetItems.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      relatedAssetItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className="text-sm text-foreground/80 hover:underline"
                        >
                          {item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Apps</div>
                  <div className="flex flex-col gap-2">
                    {relatedAppItems.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      relatedAppItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className="text-sm text-foreground/80 hover:underline"
                        >
                          {item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Flows</div>
                  <div className="flex flex-col gap-2">
                    {relatedFlowItems.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None</span>
                    ) : (
                      relatedFlowItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className="text-sm text-foreground/80 hover:underline"
                        >
                          {item.namespace ? `${item.namespace}/${item.label}` : item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="executions" className="mt-0">
            <ExecutionsPage assetId={assetCompositeKey} embedded heading={`Executions referencing ${assetLabel}`} />
          </TabsContent>

          <TabsContent value="dependencies">
            {!hasRelatedDependencies ? (
              <Card className="p-8 bg-[#262A35] border-border space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">No dependencies yet</h3>
                  <p className="text-sm text-muted-foreground">
                    {assetLabel} doesn&apos;t reference any related assets, apps, or flows. Add relationships in the asset
                    catalog to visualize them here.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once dependencies are registered, you&apos;ll see them plotted on the graph and listed for quick navigation.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <FilterInterface
                  searchValue={dependencySearch}
                  onSearchChange={setDependencySearch}
                  activeFilters={dependencyActiveFilters}
                  onClearFilter={handleDependencyClearFilter}
                  onEditFilter={() => {}}
                  onResetFilters={handleDependencyResetFilters}
                  showChart={false}
                  onToggleShowChart={() => {}}
                  periodicRefresh={dependencyPeriodicRefresh}
                  onTogglePeriodicRefresh={setDependencyPeriodicRefresh}
                  onRefreshData={handleDependencyRefresh}
                  columns={dependencyColumns}
                  onColumnsChange={handleDependencyColumnsChange}
                  selectedStates={[]}
                  statesOperator="in"
                  onSelectedStatesChange={() => {}}
                  onStatesOperatorChange={() => {}}
                  selectedInterval="last-7-days"
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
                  selectedNamespaces={[]}
                  namespaceOperator="in"
                  namespaceCustomValue=""
                  onNamespacesSelectionChange={() => {}}
                  onNamespaceOperatorChange={() => {}}
                  onNamespaceCustomValueChange={() => {}}
                  selectedFlows={dependencySelectedFlows}
                  flowOperator={dependencyFlowOperator}
                  flowCustomValue={dependencyFlowCustomValue}
                  onFlowsSelectionChange={setDependencySelectedFlows}
                  onFlowOperatorChange={setDependencyFlowOperator}
                  onFlowCustomValueChange={setDependencyFlowCustomValue}
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
                  savedFilters={dependencySavedFilters}
                  onSaveFilter={handleDependencySaveFilter}
                  onLoadFilter={handleDependencyLoadFilter}
                  onDeleteFilter={handleDependencyDeleteFilter}
                  onUpdateFilter={handleDependencyUpdateFilter}
                  visibleFilters={dependencyVisibleFilters}
                  onVisibleFiltersChange={setDependencyVisibleFilters}
                  onResetFilter={handleDependencyResetFilter}
                  filterOptions={DEPENDENCY_FILTER_OPTIONS}
                  dependencyAssetFilters={assetDependencyFilters}
                  onDependencyAssetFiltersChange={setAssetDependencyFilters}
                  dependencyAppFilters={appDependencyFilters}
                  onDependencyAppFiltersChange={setAppDependencyFilters}
                  flowOptions={dependencyFlowOptions}
                  showChartToggleControl={false}
                  showPeriodicRefreshControl={false}
                  searchPlaceholder="Search dependencies..."
                />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <Card className="p-6 bg-[#262A35] border-border space-y-6">
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {legendItems.map((item) => (
                        <span key={item.label} className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <svg
                        viewBox={`0 0 ${graphNodes.size.width} ${graphNodes.size.height}`}
                        className="w-full"
                        style={{ height: graphNodes.size.height }}
                      >
                        {graphNodes.nodes
                          .filter((node) => node.id !== assetCompositeKey)
                          .map((node) => (
                            <line
                              key={`edge-${node.id}`}
                              x1={graphNodes.center.x}
                              y1={graphNodes.center.y}
                              x2={node.x}
                              y2={node.y}
                              stroke="#373B4A"
                              strokeWidth={1.2}
                              strokeLinecap="round"
                            />
                          ))}

                        {graphNodes.nodes.map((node) => {
                          const styleKey = node.type === "primary" ? "primary" : node.type;
                          const color = CHIP_COLORS[styleKey].fill;
                          const isSelected = node.id === selectedNodeId;
                          const radius = node.type === "primary" ? 22 : 16;
                          const haloRadius = radius + (isSelected ? 6 : 3);

                          return (
                            <g
                              key={node.id}
                              className="cursor-pointer"
                              onClick={() => handleNodeSelect(node.id)}
                            >
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={haloRadius}
                                fill="#11141F"
                                opacity={0.85}
                              />
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={radius}
                                fill={color}
                                stroke={isSelected ? "#C4B5FD" : "#1F232D"}
                                strokeWidth={isSelected ? 3 : 2}
                              />
                              <text
                                x={node.x}
                                y={node.y + radius + 12}
                                textAnchor="middle"
                                className="fill-muted-foreground text-xs font-mono"
                              >
                                {node.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </Card>

                  <Card className="p-6 bg-[#262A35] border-border space-y-4">
                    <div>
                      <div className="text-sm font-semibold">Dependency catalog</div>
                      <p className="text-sm text-muted-foreground">
                        Search linked assets, apps, and flows. Selecting an entry highlights it in the graph.
                      </p>
                    </div>
                    <Input
                      value={dependencySearch}
                      onChange={(event) => setDependencySearch(event.target.value)}
                      placeholder="Search dependencies..."
                      className="bg-[#1F232D] border-border/70"
                    />
                    <div className="space-y-2">
                      {filteredDependencies.length === 0 ? (
                        <div className="rounded-md border border-border/50 px-3 py-4 text-center text-xs text-muted-foreground">
                          No dependencies match your search.
                        </div>
                      ) : (
                        filteredDependencies.map((item) => {
                          const kind = item.category === "Flow" ? "flow" : item.category === "App" ? "app" : "asset";
                          const isPrimary = item.id === assetCompositeKey;
                          const badgeKey = (isPrimary ? "primary" : kind) as keyof typeof CHIP_COLORS;
                          const isActive = item.id === selectedNodeId;
                          return (
                            <div
                              key={`${item.category}-${item.id}`}
                              className={`flex items-center gap-3 rounded-md border px-3 py-2 transition ${
                                isActive ? "border-primary/50 bg-white/10" : "border-border/50 bg-[#1F232D] hover:bg-white/5"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleNodeSelect(item.id)}
                                className="flex flex-1 flex-col items-start gap-1 text-left min-w-0"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  {dependencyColumnVisibility.category && (
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${CHIP_COLORS[badgeKey].badge}`}
                                    >
                                      {item.category}
                                    </span>
                                  )}
                                  <span className="truncate font-mono text-sm text-foreground" title={item.label}>
                                    {item.label}
                                  </span>
                                </div>
                                {dependencyColumnVisibility.namespace && item.namespace ? (
                                  <div className="truncate font-mono text-xs text-muted-foreground" title={item.namespace}>
                                    {item.namespace}
                                  </div>
                                ) : null}
                                {dependencyColumnVisibility.detail && item.detail ? (
                                  <div className="truncate text-xs text-muted-foreground" title={item.detail}>
                                    {item.detail}
                                  </div>
                                ) : null}
                              </button>
                              {item.href ? (
                                <Link
                                  href={item.href}
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                  onClick={(event) => event.stopPropagation()}
                                  aria-label={`Open ${item.category.toLowerCase()} ${item.label}`}
                                >
                                  <Link2 className="h-4 w-4" />
                                </Link>
                              ) : (
                                <Link2 className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) {
                resetEditForm();
              }
            }}
          >
            <DialogContent className="max-w-3xl bg-[#262A35] border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Edit asset</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Update the core properties, relationships, and metadata for this asset.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitEditAsset} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-asset-id">ID *</Label>
                    <Input
                      id="edit-asset-id"
                      value={editFormState.id}
                      onChange={(event) => handleEditAssetChange("id", event.target.value)}
                      placeholder="unique_asset_id"
                      required
                      disabled={!assetIsCustom}
                    />
                    {!assetIsCustom ? (
                      <p className="text-xs text-muted-foreground">System asset IDs are read-only.</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-asset-namespace">Namespace *</Label>
                    <Input
                      id="edit-asset-namespace"
                      value={editFormState.namespace}
                      onChange={(event) => handleEditAssetChange("namespace", event.target.value)}
                      placeholder="company.team"
                      required
                      disabled={!assetIsCustom}
                    />
                    {!assetIsCustom ? (
                      <p className="text-xs text-muted-foreground">System asset namespaces are read-only.</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-asset-type">Type *</Label>
                    <Input
                      id="edit-asset-type"
                      value={editFormState.type}
                      onChange={(event) => handleEditAssetChange("type", event.target.value)}
                      placeholder="Dataset, VM, Service..."
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 md:items-start">
                  <div className="space-y-2">
                    <Label htmlFor="edit-asset-display-name">Display name</Label>
                    <Input
                      id="edit-asset-display-name"
                      value={editFormState.displayName}
                      onChange={(event) => handleEditAssetChange("displayName", event.target.value)}
                      placeholder="Human-readable label"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="edit-asset-emit-events" className="text-sm font-medium text-foreground">
                        Emit events
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="p-0 text-muted-foreground transition-colors hover:text-foreground"
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
                        {editFormState.emitEvents ? "Enabled" : "Disabled"}
                      </span>
                      <Switch
                        id="edit-asset-emit-events"
                        checked={editFormState.emitEvents}
                        onCheckedChange={(checked) => handleEditAssetChange("emitEvents", Boolean(checked))}
                        aria-label="Emit events"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-asset-description">Description</Label>
                  <Textarea
                    id="edit-asset-description"
                    value={editFormState.description}
                    onChange={(event) => handleEditAssetChange("description", event.target.value)}
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
                    <Button type="button" variant="outline" size="sm" onClick={addEditValuePair}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editValuePairs.map((pair, index) => (
                      <div
                        key={`edit-value-pair-${index}`}
                        className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                      >
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Key</Label>
                          <Input
                            value={pair.key}
                            onChange={(event) => handleEditValuePairChange(index, "key", event.target.value)}
                            placeholder="metadata.owner"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Value</Label>
                          <Input
                            value={pair.value}
                            onChange={(event) => handleEditValuePairChange(index, "value", event.target.value)}
                            placeholder="jane@example.com"
                          />
                        </div>
                        <div className="pt-6">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => removeEditValuePair(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Related resources</Label>
                    <p className="text-xs text-muted-foreground">
                      Link this asset to other catalog entries for richer dependency graphs.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Assets</span>
                      <Popover open={editAssetPickerOpen} onOpenChange={setEditAssetPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between bg-[#1F232D] border-border/60"
                          >
                            <span>
                              {editFormState.relatedAssets.length > 0
                                ? `${editFormState.relatedAssets.length} selected`
                                : "Select assets"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72 p-0 bg-[#1F232D] border-border">
                          <ScrollArea className="max-h-64">
                            {assetOptions.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-muted-foreground">No other assets available.</div>
                            ) : (
                              assetOptions.map((option) => {
                                const checked = editFormState.relatedAssets.includes(option.id);
                                return (
                                  <label
                                    key={option.id}
                                    className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-[#32384A]"
                                  >
                                    <Checkbox checked={checked} onCheckedChange={() => handleEditAssetToggle(option.id)} />
                                    <div className="flex flex-col">
                                      <span className="text-sm text-foreground">{option.label}</span>
                                      <span className="text-xs text-muted-foreground">{option.id}</span>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      {editFormState.relatedAssets.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {editFormState.relatedAssets.map((assetKey) => {
                            const option = assetOptions.find((item) => item.id === assetKey);
                            return (
                              <Badge key={assetKey} variant="outline" className="text-xs">
                                {option?.label ?? assetKey}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Apps</span>
                      <Popover open={editAppPickerOpen} onOpenChange={setEditAppPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between bg-[#1F232D] border-border/60"
                          >
                            <span>
                              {editFormState.relatedApps.length > 0
                                ? `${editFormState.relatedApps.length} selected`
                                : "Select apps"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72 p-0 bg-[#1F232D] border-border">
                          <ScrollArea className="max-h-64">
                            {appOptions.map((option) => {
                              const checked = editFormState.relatedApps.includes(option.id);
                              return (
                                <label
                                  key={option.id}
                                  className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-[#32384A]"
                                >
                                  <Checkbox checked={checked} onCheckedChange={() => handleEditAppToggle(option.id)} />
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
                      {editFormState.relatedApps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {editFormState.relatedApps.map((appId) => {
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
                      <Popover open={editFlowPickerOpen} onOpenChange={setEditFlowPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between bg-[#1F232D] border-border/60"
                          >
                            <span>
                              {editFormState.relatedFlows.length > 0
                                ? `${editFormState.relatedFlows.length} selected`
                                : "Select flows"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72 p-0 bg-[#1F232D] border-border">
                          <ScrollArea className="max-h-64">
                            {flowSelectOptions.map((option) => {
                              const checked = editFormState.relatedFlows.includes(option.id);
                              return (
                                <label
                                  key={option.id}
                                  className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-[#32384A]"
                                >
                                  <Checkbox checked={checked} onCheckedChange={() => handleEditFlowToggle(option.id)} />
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
                      {editFormState.relatedFlows.length > 0 && (
                        <div className="space-y-1.5">
                          {editFormState.relatedFlows.map((flowId) => {
                            const option = flowSelectOptions.find((item) => item.id === flowId);
                            const existing = (asset.relatedFlows ?? []).find((flow) => flow.flow === flowId);
                            const namespace = option?.namespace ?? existing?.namespace;
                            return (
                              <div key={flowId} className="inline-flex">
                                <Badge variant="outline" className="text-xs">
                                  {namespace ? `${namespace}/${flowId}` : flowId}
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
                      resetEditForm();
                      setEditDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#8408FF] hover:bg-[#8613f7]">
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </Tabs>
  );
}
