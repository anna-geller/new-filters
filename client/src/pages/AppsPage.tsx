import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import AppsTable, { type AppRow } from '@/components/AppsTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { appsSavedFiltersStorage } from '@/utils/appsSavedFiltersStorage';
import type { TagOption } from '@/components/TagsFilterEditor';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const APP_FILTER_OPTIONS: FilterOption[] = [
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false, order: 1 },
  { id: 'flow', label: 'Flow', description: 'Filter by associated flow', enabled: false, order: 2 },
  { id: 'tags', label: 'Tags', description: 'Filter by tags', enabled: false, order: 3 },
  { id: 'enabled', label: 'Enabled', description: 'Filter by enabled status', enabled: false, order: 4 },
];

const APP_TAG_OPTIONS: TagOption[] = [
  { id: 'Reporting', label: 'Reporting' },
  { id: 'Analytics', label: 'Analytics' },
  { id: 'Public', label: 'Public' },
  { id: 'Form', label: 'Form' },
  { id: 'Cloud', label: 'Cloud' },
  { id: 'AI', label: 'AI' },
];

const APP_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Name', description: 'Display name of the App', visible: true, order: 1 },
  { id: 'type', label: 'Type', description: 'App type e.g. app triggering an Execution', visible: true, order: 2 },
  { id: 'tags', label: 'Tags', description: 'List of categorization tags attached to the app', visible: true, order: 3 },
  { id: 'namespace', label: 'Namespace', description: 'Namespace of the app', visible: true, order: 4 },
  { id: 'flow', label: 'Flow', description: 'Name of the flow associated with the app', visible: true, order: 5 },
];

const APP_ROWS: AppRow[] = [
  {
    name: 'Form to request and download data',
    type: 'Execution',
    tags: ['Reporting', 'Analytics'],
    namespace: 'company.team',
    flow: 'get_data',
  },
  {
    name: 'Form to sign up for Kestra Cloud',
    type: 'Execution',
    tags: ['Public', 'Form', 'Cloud'],
    namespace: 'company.team',
    flow: 'kestra_cloud_form',
  },
  {
    name: "Interact with Kestra's AI Agent",
    type: 'Execution',
    tags: ['AI'],
    namespace: 'company.sales',
    flow: 'kestra_mcp_docker',
  },
];

const FLOW_OPTIONS = [
  { id: 'get_data', label: 'get_data', description: 'Data retrieval flow' },
  { id: 'kestra_cloud_form', label: 'kestra_cloud_form', description: 'Kestra Cloud signup flow' },
  { id: 'kestra_mcp_docker', label: 'kestra_mcp_docker', description: 'AI agent flow' },
];

const NAMESPACE_OPTIONS = ['company.team', 'company.sales'];

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const operatorDisplay: Record<string, string> = {
  'in': 'in',
  'not-in': 'not in',
  'contains': 'contains',
  'starts-with': 'starts with',
  'ends-with': 'ends with',
};

export default function AppsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState<string>('in');
  const [namespaceCustomValue, setNamespaceCustomValue] = useState<string>('');
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsOperator, setTagsOperator] = useState<string>('in');
  const [tagsCustomValue, setTagsCustomValue] = useState<string>('');
  const [selectedEnabled, setSelectedEnabled] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>(APP_COLUMNS.map((col) => ({ ...col })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  useEffect(() => {
    setSavedFilters(appsSavedFiltersStorage.getAll());
  }, []);

  const filteredRows = useMemo(() => {
    return APP_ROWS.filter((row) => {
      if (searchValue.trim()) {
        const needle = searchValue.trim().toLowerCase();
        const haystack = `${row.name} ${row.type} ${row.namespace} ${row.flow} ${row.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }

      if (selectedNamespaces.length > 0) {
        if (namespaceOperator === 'in' && !selectedNamespaces.includes(row.namespace)) {
          return false;
        }
        if (namespaceOperator === 'not-in' && selectedNamespaces.includes(row.namespace)) {
          return false;
        }
        if (namespaceOperator === 'contains' && !row.namespace.toLowerCase().includes(namespaceCustomValue.toLowerCase())) {
          return false;
        }
        if (namespaceOperator === 'starts-with' && !row.namespace.toLowerCase().startsWith(namespaceCustomValue.toLowerCase())) {
          return false;
        }
        if (namespaceOperator === 'ends-with' && !row.namespace.toLowerCase().endsWith(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      }

      if (selectedFlows.length > 0 && !selectedFlows.includes(row.flow)) {
        return false;
      }

      if (selectedTags.length > 0) {
        if (tagsOperator === 'in' && !selectedTags.some((tag) => row.tags.includes(tag))) {
          return false;
        }
        if (tagsOperator === 'not-in' && selectedTags.some((tag) => row.tags.includes(tag))) {
          return false;
        }
        if (tagsOperator === 'contains' && !row.tags.join(',').toLowerCase().includes(tagsCustomValue.toLowerCase())) {
          return false;
        }
        if (tagsOperator === 'starts-with' && !row.tags.join(',').toLowerCase().startsWith(tagsCustomValue.toLowerCase())) {
          return false;
        }
        if (tagsOperator === 'ends-with' && !row.tags.join(',').toLowerCase().endsWith(tagsCustomValue.toLowerCase())) {
          return false;
        }
      }

      if (selectedEnabled !== null) {
        const isEnabled = selectedEnabled === 'true';
        // Example logic: treat flows with tags containing 'Public' as enabled
        const rowEnabled = row.tags.includes('Public');
        if (rowEnabled !== isEnabled) {
          return false;
        }
      }

      return true;
    });
  }, [
    searchValue,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    selectedTags,
    tagsOperator,
    tagsCustomValue,
    selectedEnabled,
  ]);

  const namespaceFilterValue = useMemo(() => {
    if (['in', 'not-in'].includes(namespaceOperator)) {
      if (selectedNamespaces.length === 0) return 'Any';
      if (selectedNamespaces.length === 1) return selectedNamespaces[0];
      return `${selectedNamespaces.length} selected`;
    }
    if (!namespaceCustomValue.trim()) return 'Any';
    return namespaceCustomValue;
  }, [selectedNamespaces, namespaceOperator, namespaceCustomValue]);

  const flowFilterValue = useMemo(() => {
    if (selectedFlows.length === 0) return 'Any';
    if (selectedFlows.length === 1) return selectedFlows[0];
    return `${selectedFlows.length} selected`;
  }, [selectedFlows]);

  const tagsFilterValue = useMemo(() => {
    if (['contains', 'starts-with', 'ends-with'].includes(tagsOperator)) {
      return tagsCustomValue || '—';
    }
    if (selectedTags.length === 0) return 'Any';
    if (selectedTags.length === 1) return selectedTags[0];
    return `${selectedTags.length} selected`;
  }, [selectedTags, tagsOperator, tagsCustomValue]);

  const enabledFilterValue = useMemo(() => {
    if (selectedEnabled === null) return 'Any';
    return selectedEnabled === 'true' ? 'True' : 'False';
  }, [selectedEnabled]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes('namespace')) {
      filters.push({
        id: 'namespace',
        label: 'Namespace',
        value: namespaceFilterValue,
        operator: operatorDisplay[namespaceOperator] ?? namespaceOperator,
      });
    }

    if (visibleFilters.includes('flow')) {
      filters.push({
        id: 'flow',
        label: 'Flow',
        value: flowFilterValue,
        operator: 'in',
      });
    }

    if (visibleFilters.includes('tags')) {
      filters.push({
        id: 'tags',
        label: 'Tags',
        value: tagsFilterValue,
        operator: operatorDisplay[tagsOperator] ?? tagsOperator,
      });
    }

    if (visibleFilters.includes('enabled')) {
      filters.push({
        id: 'enabled',
        label: 'Enabled',
        value: enabledFilterValue,
        operator: 'equals',
      });
    }

    return filters;
  }, [
    visibleFilters,
    namespaceFilterValue,
    namespaceOperator,
    flowFilterValue,
    tagsFilterValue,
    tagsOperator,
    enabledFilterValue,
  ]);

  const handleClearFilter = (filterId: string) => {
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));

    if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    } else if (filterId === 'tags') {
      setSelectedTags([]);
      setTagsOperator('in');
      setTagsCustomValue('');
    } else if (filterId === 'enabled') {
      setSelectedEnabled(null);
    }
  };

  const handleEditFilter = () => {
    // Popover handled in FilterInterface
  };

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setSelectedNamespaces([]);
    setNamespaceOperator('in');
    setNamespaceCustomValue('');
    setSelectedFlows([]);
    setSelectedTags([]);
    setTagsOperator('in');
    setTagsCustomValue('');
    setSelectedEnabled(null);
    setVisibleFilters([]);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    } else if (filterId === 'tags') {
      setSelectedTags([]);
      setTagsOperator('in');
      setTagsCustomValue('');
    } else if (filterId === 'enabled') {
      setSelectedEnabled(null);
    }
  };

  const getCurrentFilterState = (): SavedFilter['filterState'] => ({
    searchValue,
    selectedStates: [],
    statesOperator: 'in',
    selectedInterval: 'last-7-days',
    selectedLabels: [],
    labelsOperator: 'has-any-of',
    labelsCustomValue: '',
    selectedTags,
    tagsOperator,
    tagsCustomValue,
    selectedInputs: [],
    inputsOperator: 'has-any-of',
    inputsCustomValue: '',
    selectedOutputs: [],
    outputsOperator: 'has-any-of',
    outputsCustomValue: '',
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    selectedScopes: [],
    selectedKinds: [],
    selectedHierarchy: 'all',
    selectedInitialExecution: '',
    enabledValue: selectedEnabled,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const id = `filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };
    appsSavedFiltersStorage.save(filter);
    setSavedFilters(appsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? '');
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? 'in');
    setNamespaceCustomValue(state.namespaceCustomValue ?? '');
    setSelectedFlows(state.selectedFlows ?? []);
    setSelectedTags(state.selectedTags ?? []);
    setTagsOperator(state.tagsOperator ?? 'in');
    setTagsCustomValue(state.tagsCustomValue ?? '');
    setSelectedEnabled(state.enabledValue ?? null);

    const required = new Set<string>();
    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? '').trim()) {
      required.add('namespace');
    }
    if ((state.selectedFlows ?? []).length > 0) {
      required.add('flow');
    }
    if ((state.selectedTags ?? []).length > 0 || (state.tagsCustomValue ?? '').trim()) {
      required.add('tags');
    }
    if (state.enabledValue !== null && state.enabledValue !== undefined) {
      required.add('enabled');
    }
    setVisibleFilters(Array.from(required));
  };

  const handleDeleteFilter = (filterId: string) => {
    appsSavedFiltersStorage.delete(filterId);
    setSavedFilters(appsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    appsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(appsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing apps data...');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">Apps</h1>
            <span className="text-sm text-muted-foreground">Build custom apps to interact with Kestra from the outside world</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground">Jump to...</button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Ctrl+Cmd+K</span>
            </div>
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover-elevate">
              Create
            </button>
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
          onColumnsChange={setColumns}
          selectedStates={[]}
          statesOperator={'in'}
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedInterval={'last-7-days'}
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={() => {}}
          selectedLabels={[]}
          labelsOperator={'has-any-of'}
          labelsCustomValue={''}
          onLabelsSelectionChange={() => {}}
          onLabelsOperatorChange={() => {}}
          onLabelsCustomValueChange={() => {}}
          selectedInputs={[]}
          inputsOperator={'has-any-of'}
          inputsCustomValue={''}
          onInputsSelectionChange={() => {}}
          onInputsOperatorChange={() => {}}
          onInputsCustomValueChange={() => {}}
          selectedOutputs={[]}
          outputsOperator={'has-any-of'}
          outputsCustomValue={''}
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
          onFlowsSelectionChange={setSelectedFlows}
          selectedTags={selectedTags}
          tagsOperator={tagsOperator}
          tagsCustomValue={tagsCustomValue}
          onTagsSelectionChange={setSelectedTags}
          onTagsOperatorChange={setTagsOperator}
          onTagsCustomValueChange={setTagsCustomValue}
          selectedEnabled={selectedEnabled}
          onEnabledChange={setSelectedEnabled}
          selectedScopes={[]}
          onScopesSelectionChange={() => {}}
          selectedKinds={[]}
          onKindsSelectionChange={() => {}}
          selectedHierarchy={'all'}
          onHierarchySelectionChange={() => {}}
          selectedInitialExecution={''}
          onInitialExecutionSelectionChange={() => {}}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={APP_FILTER_OPTIONS}
          flowOptions={FLOW_OPTIONS}
          namespaceOptions={NAMESPACE_OPTIONS}
          tagOptions={APP_TAG_OPTIONS}
          showChartToggleControl={false}
          searchPlaceholder="Search apps..."
        />

        <section className="p-6">
          <AppsTable rows={filteredRows} columns={columns} />
        </section>
      </main>
    </div>
  );
}
