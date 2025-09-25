import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import FlowsTable, { type FlowRow } from '@/components/FlowsTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { flowsSavedFiltersStorage } from '@/utils/flowsSavedFiltersStorage';
import type { ScopeOption } from '@/components/ScopeFilterEditor';
import type { FlowOption } from '@/components/FlowFilterEditor';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const FLOW_SCOPE_OPTIONS: ScopeOption[] = [
  {
    id: 'user',
    label: 'User Flows',
    description: 'Flows initiated by end users',
  },
  {
    id: 'system',
    label: 'System Flows',
    description: 'Flows executed automatically by the platform',
  },
];

const FLOW_FILTER_OPTIONS: FilterOption[] = [
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false, order: 1 },
  { id: 'labels', label: 'Labels', description: 'Filter by flow labels', enabled: false, order: 2 },
  { id: 'scope', label: 'Scope', description: 'Filter by flow scope', enabled: false, order: 3 },
  { id: 'flow', label: 'Flow', description: 'Filter by flow id', enabled: false, order: 4 },
];

const FLOW_OPTIONS: FlowOption[] = [
  { id: 'data_pipeline', label: 'data_pipeline', description: 'Data processing pipeline' },
  { id: 'microservices_and_apis', label: 'microservices_and_apis', description: 'Microservices integration flow' },
  { id: 'notification_system', label: 'notification_system', description: 'Notification system flow' },
  { id: 'payment_processing', label: 'payment_processing', description: 'Payment processing flow' },
  { id: 'user_authentication', label: 'user_authentication', description: 'User authentication flow' },
  { id: 'security_scan', label: 'security_scan', description: 'Security scan flow' },
  { id: 'email_notifications', label: 'email_notifications', description: 'Email notifications flow' },
  { id: 'payment_gateway', label: 'payment_gateway', description: 'Payment gateway flow' },
];

const FLOW_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'Id', description: 'Unique flow identifier', visible: true, order: 1 },
  { id: 'labels', label: 'Labels', description: 'Flow labels (key:value format)', visible: true, order: 2 },
  { id: 'namespace', label: 'Namespace', description: 'Namespace of the flow', visible: true, order: 3 },
  { id: 'last-execution-date', label: 'Last execution date', description: 'When the flow was last executed', visible: true, order: 4 },
  { id: 'last-execution-status', label: 'Last execution status', description: 'Status of the most recent execution', visible: true, order: 5 },
  { id: 'execution-statistics', label: 'Execution statistics', description: 'Chart showing recent execution states', visible: true, order: 6 },
  { id: 'triggers', label: 'Triggers', description: 'Triggers that can start the flow (e.g., schedule, event)', visible: true, order: 7 },
  { id: 'revision', label: 'Revision', description: 'Current version number of the flow definition', visible: true, order: 8 },
  { id: 'description', label: 'Description', description: 'Text description provided for the flow', visible: true, order: 9 },
];

const FLOW_ROWS: FlowRow[] = [
  {
    id: 'data_pipeline',
    labels: ['env:production', 'team:backend'],
    namespace: 'company',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:37 PM',
    lastExecutionStatus: 'SUCCESS',
    executionStatistics: [
      { state: 'SUCCESS', count: 5, color: '#22c55e' },
      { state: 'FAILED', count: 0, color: '#ef4444' },
    ],
    triggers: ['Schedule'],
    revision: '42',
    description: 'Primary data ingestion pipeline',
  },
  {
    id: 'microservices_and_apis',
    labels: ['env:production', 'team:backend'],
    namespace: 'company.team',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:37 PM',
    lastExecutionStatus: 'SUCCESS',
    executionStatistics: [
      { state: 'SUCCESS', count: 4, color: '#22c55e' },
      { state: 'FAILED', count: 1, color: '#ef4444' },
    ],
    triggers: ['Webhook'],
    revision: '18',
    description: 'Validates microservices and API interactions',
  },
  {
    id: 'notification_system',
    labels: ['env:production', 'team:backend'],
    namespace: 'company.team.backend',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:36 PM',
    lastExecutionStatus: 'SUCCESS',
    executionStatistics: [
      { state: 'SUCCESS', count: 6, color: '#22c55e' },
    ],
    triggers: ['S3'],
    revision: '12',
    description: 'Dispatches customer notifications',
  },
  {
    id: 'payment_processing',
    labels: ['env:production', 'team:backend'],
    namespace: 'company.team.frontend',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:36 PM',
    lastExecutionStatus: 'SUCCESS',
    executionStatistics: [
      { state: 'SUCCESS', count: 3, color: '#22c55e' },
      { state: 'FAILED', count: 1, color: '#ef4444' },
    ],
    triggers: [],
    revision: '27',
    description: 'Handles checkout flows',
  },
  {
    id: 'user_authentication',
    labels: ['env:production', 'team:analytics'],
    namespace: 'company.analytics',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:36 PM',
    lastExecutionStatus: 'SUCCESS',
    executionStatistics: [
      { state: 'SUCCESS', count: 5, color: '#22c55e' },
    ],
    triggers: [],
    revision: '9',
    description: 'Authenticates end-users into the analytics portal',
  },
  {
    id: 'security_scan',
    labels: ['action:cvescan', 'team:security'],
    namespace: 'company.security',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:36 PM',
    lastExecutionStatus: 'SUCCESS',
    executionStatistics: [
      { state: 'SUCCESS', count: 2, color: '#22c55e' },
      { state: 'FAILED', count: 1, color: '#ef4444' },
    ],
    triggers: [],
    revision: '33',
    description: 'Runs scheduled vulnerability scans',
  },
  {
    id: 'email_notifications',
    labels: ['action:test', 'team:frontend'],
    namespace: 'company.team.api',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:36 PM',
    lastExecutionStatus: 'FAILED',
    executionStatistics: [
      { state: 'SUCCESS', count: 1, color: '#22c55e' },
      { state: 'FAILED', count: 2, color: '#ef4444' },
    ],
    triggers: [],
    revision: '5',
    description: 'Sends transactional emails to customers',
  },
  {
    id: 'payment_gateway',
    labels: ['priority:critical', 'type:user-facing'],
    namespace: 'company.team.database',
    lastExecutionDate: 'Fri, Sep 12, 2025 6:36 PM',
    lastExecutionStatus: 'FAILED',
    executionStatistics: [
      { state: 'SUCCESS', count: 2, color: '#22c55e' },
      { state: 'FAILED', count: 3, color: '#ef4444' },
    ],
    triggers: [],
    revision: '11',
    description: 'Processes gateway settlement tasks',
  },
];

const FLOW_NAMESPACE_OPTIONS = Array.from(new Set(FLOW_ROWS.map((row) => row.namespace)));

const operatorDisplay: Record<string, string> = {
  'in': 'in',
  'not-in': 'not in',
  'contains': 'contains',
  'starts-with': 'starts with',
  'ends-with': 'ends with',
  'has-any-of': 'has any of',
  'has-none-of': 'has none of',
  'has-all-of': 'has all of',
};

const DEFAULT_VISIBLE_FILTERS: string[] = [];

export default function FlowsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState<string>('in');
  const [namespaceCustomValue, setNamespaceCustomValue] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState('has-any-of');
  const [labelsCustomValue, setLabelsCustomValue] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>(FLOW_COLUMNS.map((col) => ({ ...col })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  useEffect(() => {
    const stored = flowsSavedFiltersStorage.getAll();
    setSavedFilters(stored);
  }, []);

  const filteredRows = useMemo(() => {
    return FLOW_ROWS.filter((row) => {
      if (searchValue.trim()) {
        const needle = searchValue.trim().toLowerCase();
        const haystack = `${row.id} ${row.namespace} ${row.labels.join(' ')}`.toLowerCase();
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

      if (selectedLabels.length > 0) {
        const rowLabels = new Set(row.labels);
        if (labelsOperator === 'has-any-of' && !selectedLabels.some((label) => rowLabels.has(label))) {
          return false;
        }
        if (labelsOperator === 'has-all-of' && !selectedLabels.every((label) => rowLabels.has(label))) {
          return false;
        }
        if (labelsOperator === 'has-none-of' && selectedLabels.some((label) => rowLabels.has(label))) {
          return false;
        }
        if (labelsOperator === 'contains' && !row.labels.join(',').toLowerCase().includes(labelsCustomValue.toLowerCase())) {
          return false;
        }
        if (labelsOperator === 'does-not-contain' && row.labels.join(',').toLowerCase().includes(labelsCustomValue.toLowerCase())) {
          return false;
        }
        if (labelsOperator === 'is-set' && row.labels.length === 0) {
          return false;
        }
        if (labelsOperator === 'is-not-set' && row.labels.length > 0) {
          return false;
        }
      }

      if (selectedScopes.length > 0 && !selectedScopes.includes(row.lastExecutionStatus === 'SUCCESS' ? 'user' : 'system')) {
        // For demo purposes, map statuses to pseudo scopes
        return false;
      }

      if (selectedFlows.length > 0 && !selectedFlows.includes(row.id)) {
        return false;
      }

      return true;
    });
  }, [
    searchValue,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedLabels,
    labelsOperator,
    labelsCustomValue,
    selectedScopes,
    selectedFlows,
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

  const labelsFilterValue = useMemo(() => {
    if (labelsOperator === 'is-set') return 'Any';
    if (labelsOperator === 'is-not-set') return 'None';
    if (['contains', 'does-not-contain'].includes(labelsOperator)) {
      return labelsCustomValue || '—';
    }
    if (selectedLabels.length === 0) return 'Any';
    if (selectedLabels.length === 1) return selectedLabels[0];
    return `${selectedLabels.length} selected`;
  }, [labelsOperator, labelsCustomValue, selectedLabels]);

  const scopeFilterValue = useMemo(() => {
    if (selectedScopes.length === 0) return 'Any';
    if (selectedScopes.length === 1) {
      return FLOW_SCOPE_OPTIONS.find((option) => option.id === selectedScopes[0])?.label ?? selectedScopes[0];
    }
    return `${selectedScopes.length} selected`;
  }, [selectedScopes]);

  const flowFilterValue = useMemo(() => {
    if (selectedFlows.length === 0) return 'Any';
    if (selectedFlows.length === 1) return selectedFlows[0];
    return `${selectedFlows.length} selected`;
  }, [selectedFlows]);

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

    if (visibleFilters.includes('labels')) {
      filters.push({
        id: 'labels',
        label: 'Labels',
        value: labelsFilterValue,
        operator: operatorDisplay[labelsOperator] ?? labelsOperator,
      });
    }

    if (visibleFilters.includes('scope')) {
      filters.push({
        id: 'scope',
        label: 'Scope',
        value: scopeFilterValue,
        operator: 'in',
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

    return filters;
  }, [
    visibleFilters,
    namespaceFilterValue,
    namespaceOperator,
    labelsFilterValue,
    labelsOperator,
    scopeFilterValue,
    flowFilterValue,
  ]);

  const handleClearFilter = (filterId: string) => {
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));

    if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'labels') {
      setSelectedLabels([]);
      setLabelsOperator('has-any-of');
      setLabelsCustomValue('');
    } else if (filterId === 'scope') {
      setSelectedScopes([]);
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    }
  };

  const handleEditFilter = () => {
    // FilterInterface handles opening individual editors
  };

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setSelectedNamespaces([]);
    setNamespaceOperator('in');
    setNamespaceCustomValue('');
    setSelectedLabels([]);
    setLabelsOperator('has-any-of');
    setLabelsCustomValue('');
    setSelectedScopes([]);
    setSelectedFlows([]);
    setVisibleFilters([]);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'labels') {
      setSelectedLabels([]);
      setLabelsOperator('has-any-of');
      setLabelsCustomValue('');
    } else if (filterId === 'scope') {
      setSelectedScopes([]);
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    }
  };

  const getCurrentFilterState = (): SavedFilter['filterState'] => ({
    searchValue,
    selectedStates: [],
    statesOperator: 'in',
    selectedInterval: 'last-7-days',
    selectedLabels,
    labelsOperator,
    labelsCustomValue,
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
    selectedScopes,
    selectedKinds: [],
    selectedHierarchy: 'all',
    selectedInitialExecution: '',
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
    flowsSavedFiltersStorage.save(filter);
    setSavedFilters(flowsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue ?? '');
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? 'in');
    setNamespaceCustomValue(state.namespaceCustomValue ?? '');
    setSelectedLabels(state.selectedLabels ?? []);
    setLabelsOperator(state.labelsOperator ?? 'has-any-of');
    setLabelsCustomValue(state.labelsCustomValue ?? '');
    setSelectedScopes(state.selectedScopes ?? []);
    setSelectedFlows(state.selectedFlows ?? []);

    const required = new Set<string>();
    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? '').trim()) {
      required.add('namespace');
    }
    if ((state.selectedLabels ?? []).length > 0) {
      required.add('labels');
    }
    if ((state.selectedScopes ?? []).length > 0) {
      required.add('scope');
    }
    if ((state.selectedFlows ?? []).length > 0) {
      required.add('flow');
    }
    setVisibleFilters(Array.from(required));
  };

  const handleDeleteFilter = (filterId: string) => {
    flowsSavedFiltersStorage.delete(filterId);
    setSavedFilters(flowsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    flowsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(flowsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing flows data...');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Flows</h1>
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
          onColumnsChange={handleColumnsChange}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedInterval="last-7-days"
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={() => {}}
          selectedLabels={selectedLabels}
          labelsOperator={labelsOperator}
          labelsCustomValue={labelsCustomValue}
          onLabelsSelectionChange={setSelectedLabels}
          onLabelsOperatorChange={setLabelsOperator}
          onLabelsCustomValueChange={setLabelsCustomValue}
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
          namespaceOptions={FLOW_NAMESPACE_OPTIONS}
          selectedFlows={selectedFlows}
          onFlowsSelectionChange={setSelectedFlows}
          selectedScopes={selectedScopes}
          onScopesSelectionChange={setSelectedScopes}
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
          filterOptions={FLOW_FILTER_OPTIONS}
          flowOptions={FLOW_OPTIONS}
          scopeOptions={FLOW_SCOPE_OPTIONS}
          showChartToggleControl={false}
        />

        <section className="p-6">
          <FlowsTable rows={filteredRows} columns={columns} />
        </section>
      </main>
    </div>
  );
}
