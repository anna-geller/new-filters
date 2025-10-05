import { useEffect, useMemo, useState } from "react";
import FilterInterface, { type FilterOption } from "@/components/FilterInterface";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/components/ExecutionsTable";
import { SavedFilter } from "@/types/savedFilters";
import { namespaceSecretsSavedFiltersStorage } from "@/utils/namespaceSecretsSavedFiltersStorage";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpDown,
  CheckCircle2,
  Copy,
  Pencil,
  PencilLine,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldQuestion,
  Star,
  Trash2,
} from "lucide-react";

interface NamespaceDetailsPageProps {
  params?: {
    namespaceId?: string;
  };
}

type SecretType = "Secret" | "Credential";

type SecretColumnId = "key" | "type" | "description" | "tags" | "provider";

interface SecretEntry {
  id: string;
  key: string;
  type: SecretType;
  description?: string;
  tags: string[];
  provider?: string;
}

interface TagDraft {
  key: string;
  value: string;
}

const NAVIGATION_ITEMS = [
  "Overview",
  "Edit",
  "Flows",
  "Executions",
  "Dependencies",
  "Secrets",
  "Variables",
  "Plugin defaults",
  "KV Store",
  "Files",
  "Revisions",
  "Audit Logs",
];

const OAUTH_PROVIDERS = [
  "GitHub OAuth2 API",
  "Microsoft OAuth2 API",
  "HubSpot OAuth2 API",
  "Notion OAuth2 API",
  "Slack OAuth2 API",
  "YouTube OAuth2 API",
  "LinkedIn OAuth2 API",
  "Zendesk OAuth2 API",
  "Google OAuth2 API",
  "Google Calendar OAuth2 API",
  "Gmail OAuth2 API",
  "Dropbox OAuth2 API",
];

const INITIAL_SECRETS: SecretEntry[] = [
  {
    id: "secret-1",
    key: "AWS_ACCESS_KEY_ID",
    type: "Secret",
    description: "Test description",
    tags: ["cloud:AWS"],
  },
  {
    id: "secret-2",
    key: "AWS_SECRET_ACCESS_KEY",
    type: "Secret",
    tags: ["cloud:AWS"],
  },
  {
    id: "secret-3",
    key: "SLACK_WEBHOOK_URL",
    type: "Credential",
    description: "Slack incoming webhook",
    tags: ["chatops:slack"],
    provider: "Slack OAuth2 API",
  },
];

const DEFAULT_VISIBLE_FILTERS: string[] = [];
const FILTER_OPTIONS: FilterOption[] = [];

const SECRET_COLUMNS: ColumnConfig[] = [
  { id: "key", label: "Key", description: "Unique identifier for the secret", visible: true, order: 1 },
  { id: "type", label: "Type", description: "Secret vs credential", visible: true, order: 2 },
  { id: "description", label: "Description", description: "Optional context for the secret", visible: true, order: 3 },
  { id: "tags", label: "Tags", description: "Key/value labels", visible: true, order: 4 },
  { id: "provider", label: "Provider", description: "Connected OAuth2 provider", visible: false, order: 5 },
];

export default function NamespaceDetailsPage({ params }: NamespaceDetailsPageProps) {
  const namespaceParam = params?.namespaceId ?? "company";
  const namespaceName = decodeURIComponent(namespaceParam);

  const { toast } = useToast();

  const [activeNav, setActiveNav] = useState<string>("Secrets");
  const [searchValue, setSearchValue] = useState("");
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(SECRET_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const [secrets, setSecrets] = useState<SecretEntry[]>(INITIAL_SECRETS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formType, setFormType] = useState<SecretType>("Secret");
  const [formKey, setFormKey] = useState("");
  const [formSecret, setFormSecret] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [tagsDraft, setTagsDraft] = useState<TagDraft[]>([{ key: "", value: "" }]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isProviderConnected, setIsProviderConnected] = useState(false);
  const [isOauthDialogOpen, setIsOauthDialogOpen] = useState(false);

  useEffect(() => {
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const filteredSecrets = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    if (!term) {
      return secrets;
    }

    return secrets.filter((secret) => {
      const haystack = [
        secret.key,
        secret.type,
        secret.description ?? "",
        secret.provider ?? "",
        secret.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [searchValue, secrets]);

  const resetFormState = () => {
    setFormType("Secret");
    setFormKey("");
    setFormSecret("");
    setFormDescription("");
    setTagsDraft([{ key: "", value: "" }]);
    setSelectedProvider("");
    setIsProviderConnected(false);
    setIsOauthDialogOpen(false);
  };

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      resetFormState();
    }
  };

  const handleAddTagDraft = () => {
    setTagsDraft((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleTagDraftChange = (index: number, field: keyof TagDraft, value: string) => {
    setTagsDraft((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveTagDraft = (index: number) => {
    setTagsDraft((prev) => {
      if (prev.length === 1) {
        return [{ key: "", value: "" }];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleAuthorizeProvider = () => {
    setIsProviderConnected(true);
    setIsOauthDialogOpen(false);
  };

  const handleRemoveProvider = () => {
    setIsProviderConnected(false);
    setSelectedProvider("");
  };

  const handleSaveSecret = () => {
    if (!formKey.trim()) {
      return;
    }

    if (formType === "Credential" && (!selectedProvider || !isProviderConnected)) {
      return;
    }

    const formattedTags = tagsDraft
      .map((tag) => (tag.key && tag.value ? `${tag.key}:${tag.value}` : ""))
      .filter(Boolean);

    const newEntry: SecretEntry = {
      id: `namespace-secret-${Date.now()}`,
      key: formKey.trim(),
      type: formType,
      description: formDescription.trim() || undefined,
      tags: formattedTags,
      provider: formType === "Credential" ? selectedProvider : undefined,
    };

    setSecrets((prev) => [newEntry, ...prev]);
    handleDrawerChange(false);
  };

  const saveDisabled =
    !formKey.trim() ||
    (formType === "Credential" && (!selectedProvider || !isProviderConnected));

  const activeFilters: { id: string; label: string; value: string; operator?: string }[] = [];

  const handleCopyReference = async (entry: SecretEntry) => {
    const snippet = entry.type === "Secret"
      ? `{{ secret('${entry.key}') }}`
      : `{{ credential('${entry.key}') }}`;

    try {
      await navigator.clipboard.writeText(snippet);
      toast({ title: "Copied", description: `Copied ${entry.type.toLowerCase()} reference for ${entry.key}.` });
    } catch (error) {
      console.error("Failed to copy secret reference", error);
      toast({ title: "Copy failed", description: "We couldn't copy that reference. Try again.", variant: "destructive" });
    }
  };

  const handleClearFilter = (_filterId: string) => {
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setSearchValue("");
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(SECRET_COLUMNS.map((column) => ({ ...column })));
  };

  const handleResetFilterById = (_filterId: string) => {
    handleResetFilters();
  };

  const handleRefreshData = () => {
    console.log(`Refreshing secrets for namespace ${namespaceName}...`);
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
  });

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `namespace-secrets-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    namespaceSecretsSavedFiltersStorage.save(filter);
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? "");

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : [...DEFAULT_VISIBLE_FILTERS];

    setVisibleFilters(Array.from(new Set(restoredVisibleFilters)));
  };

  const handleDeleteFilter = (filterId: string) => {
    namespaceSecretsSavedFiltersStorage.delete(filterId);
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    namespaceSecretsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(namespaceSecretsSavedFiltersStorage.getAll());
  };

  const renderCell = (entry: SecretEntry, columnId: SecretColumnId) => {
    switch (columnId) {
      case "key":
        return <span className="font-mono text-xs text-primary-foreground/80">{entry.key}</span>;
      case "type":
        return <span className="text-sm text-foreground">{entry.type}</span>;
      case "description":
        return entry.description ? <span className="text-sm text-muted-foreground">{entry.description}</span> : <span className="text-muted-foreground">—</span>;
      case "tags":
        return entry.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={`${entry.id}-${tag}`} variant="secondary" className="border border-border/60 bg-muted/40 px-2 py-1 text-xs text-foreground/90">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "provider":
        return entry.provider ? <span className="text-sm text-foreground">{entry.provider}</span> : <span className="text-muted-foreground">—</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="px-6 py-5 space-y-4 bg-card/60">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/namespaces">Namespaces</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{namespaceName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-foreground">{namespaceName}</span>
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="outline" className="border-border/70 bg-transparent text-foreground hover:bg-muted/40">
                <PencilLine className="h-4 w-4" />
                Edit namespace
              </Button>
              <Button variant="secondary" className="border border-border/60 bg-muted/40 text-foreground hover:bg-muted/60">
                Inherited secrets
              </Button>
              <Sheet open={drawerOpen} onOpenChange={handleDrawerChange}>
                <SheetTrigger asChild>
                  <Button className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    New secret
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full border-l border-border bg-background text-foreground sm:max-w-xl"
                >
                  <SheetHeader>
                    <SheetTitle>New secret</SheetTitle>
                    <SheetDescription>
                      Store a new secret or connect an OAuth2 credential for this namespace.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 rounded-md bg-muted/50 p-1 text-sm font-medium">
                      {(["Secret", "Credential"] as SecretType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setFormType(type);
                            if (type === "Secret") {
                              setSelectedProvider("");
                              setIsProviderConnected(false);
                              setIsOauthDialogOpen(false);
                            }
                          }}
                          className={cn(
                            "rounded-md px-3 py-2 transition-colors",
                            formType === type
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {type === "Secret" ? "Secret" : "Credential"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="namespace-secret-key">Key *</Label>
                        <Input
                          id="namespace-secret-key"
                          value={formKey}
                          onChange={(event) => setFormKey(event.target.value)}
                          placeholder={formType === "Credential" ? "Provide a unique identifier for this credential" : "Provide a unique identifier for this secret"}
                        />
                      </div>

                      {formType === "Secret" ? (
                        <div className="space-y-2">
                          <Label htmlFor="namespace-secret-value">Secret</Label>
                          <Input
                            id="namespace-secret-value"
                            value={formSecret}
                            onChange={(event) => setFormSecret(event.target.value)}
                            placeholder="Enter secret value"
                            type="password"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="namespace-secret-description">Description</Label>
                        <Input
                          id="namespace-secret-description"
                          value={formDescription}
                          onChange={(event) => setFormDescription(event.target.value)}
                          placeholder={`Short description of the ${formType.toLowerCase()}`}
                        />
                      </div>

                      {formType === "Credential" ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select
                              value={selectedProvider}
                              onValueChange={(value) => {
                                setSelectedProvider(value);
                                setIsProviderConnected(false);
                                setIsOauthDialogOpen(false);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a provider" />
                              </SelectTrigger>
                              <SelectContent>
                                {OAUTH_PROVIDERS.map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedProvider && !isProviderConnected ? (
                            <Button
                              type="button"
                              className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                              onClick={() => setIsOauthDialogOpen(true)}
                            >
                              Connect my account
                            </Button>
                          ) : null}

                          {selectedProvider && isProviderConnected ? (
                            <div className="mt-2 flex flex-col gap-3 rounded-md border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                              <div className="flex items-center gap-2 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Account connected ({selectedProvider})
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/10"
                                  onClick={() => setIsOauthDialogOpen(true)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  Reconnect
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-200 hover:bg-emerald-500/10"
                                  onClick={handleRemoveProvider}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete credential
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        <Label>Tags</Label>
                        <div className="flex flex-col gap-3">
                          {tagsDraft.map((tag, index) => (
                            <div key={`tag-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                              <Input
                                value={tag.key}
                                onChange={(event) => handleTagDraftChange(index, "key", event.target.value)}
                                placeholder="Key"
                              />
                              <Input
                                value={tag.value}
                                onChange={(event) => handleTagDraftChange(index, "value", event.target.value)}
                                placeholder="Value"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveTagDraft(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-muted text-foreground hover:bg-muted/80"
                          onClick={handleAddTagDraft}
                        >
                          <Plus className="h-4 w-4" />
                          Add tag
                        </Button>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="mt-8">
                    <div className="flex w-full justify-end gap-3">
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:bg-muted"
                        onClick={() => handleDrawerChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90"
                        onClick={handleSaveSecret}
                        disabled={saveDisabled}
                      >
                        Save
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <nav className="-mb-2 flex flex-wrap items-center gap-1 text-sm">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveNav(item)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
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
          selectedNamespaces={[]}
          namespaceOperator="in"
          namespaceCustomValue=""
          onNamespacesSelectionChange={() => {}}
          onNamespaceOperatorChange={() => {}}
          onNamespaceCustomValueChange={() => {}}
          namespaceOptions={[]}
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
          onResetFilter={handleResetFilterById}
          filterOptions={FILTER_OPTIONS}
          searchPlaceholder="Search secrets"
          showChartToggleControl={false}
        />

        <div className="flex-1 overflow-auto px-6 pb-8">
          <div className="mt-4 rounded-lg border border-border/60 bg-card/40 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-sm">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground">
                    {visibleColumns.map((column) => (
                      <th key={column.id} className="px-4 py-3 text-left font-semibold">
                        {column.id === "key" ? (
                          <span className="inline-flex items-center gap-2 text-sm text-primary/80">
                            {column.label}
                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                          </span>
                        ) : (
                          column.label
                        )}
                      </th>
                    ))}
                    <th className="w-[120px] px-4 py-3 text-right font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSecrets.map((entry) => (
                    <tr key={entry.id} className="border-t border-border/50 bg-card/60">
                      {visibleColumns.map((column) => (
                        <td key={column.id} className="px-4 py-3 align-top">
                          {renderCell(entry, column.id as SecretColumnId)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-muted"
                            onClick={() => handleCopyReference(entry)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="border border-border/70 bg-muted/60 text-muted-foreground hover:bg-destructive/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isOauthDialogOpen} onOpenChange={setIsOauthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authorize {selectedProvider}</DialogTitle>
            <DialogDescription>
              Grant access so this credential can be refreshed securely. The simulated prompt mirrors an OAuth2 flow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-md border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Kestra OAuth Broker</p>
                <p className="text-xs text-muted-foreground">requests access to continue with {selectedProvider}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-md border border-border/60 bg-background p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Read workspace details</p>
                  <p className="text-xs text-muted-foreground">Used to confirm account ownership and metadata.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldQuestion className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Manage OAuth refresh tokens</p>
                  <p className="text-xs text-muted-foreground">Lets Kestra rotate tokens automatically when they expire.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsOauthDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAuthorizeProvider} className="bg-primary border border-primary-border text-primary-foreground hover:bg-primary/90">
              Authorize integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
