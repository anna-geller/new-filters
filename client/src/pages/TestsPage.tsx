import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, SkipForward, XCircle } from 'lucide-react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import TestsTable, { type TestRow } from '@/components/TestsTable';
import type { ColumnConfig } from '@/types/savedFilters';
import { SavedFilter } from '@/types/savedFilters';
import { testsSavedFiltersStorage } from '@/utils/testsSavedFiltersStorage';
import type { StateOption } from '@/components/StateFilterEditor';
import type { FlowOption } from '@/components/FlowFilterEditor';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const TEST_STATE_OPTIONS: StateOption[] = [
  {
    id: 'SUCCESS',
    label: 'SUCCESS',
    icon: CheckCircle,
    description: 'Test completed successfully',
  },
  {
    id: 'FAILED',
    label: 'FAILED',
    icon: XCircle,
    description: 'Test failed during execution',
  },
  {
    id: 'ERROR',
    label: 'ERROR',
    icon: AlertTriangle,
    description: 'Test encountered an unexpected error',
  },
  {
    id: 'SKIPPED',
    label: 'SKIPPED',
    icon: SkipForward,
    description: 'Test was skipped',
  },
];

const TEST_ROWS: TestRow[] = [
  { id: 'test_data_pipeline', namespace: 'company', flow: 'data-processing-pipeline', state: 'SUCCESS' },
  { id: 'test_microservices_and_apis', namespace: 'company.team', flow: 'microservices-and-apis', state: 'SUCCESS' },
  { id: 'test_notification_system', namespace: 'company.backend', flow: 'email-notifications', state: 'ERROR' },
  { id: 'test_payment_processing', namespace: 'company.backend', flow: 'payment-gateway', state: 'ERROR' },
  { id: 'test_user_authentication', namespace: 'tutorial', flow: 'user-auth-flow', state: 'FAILED' },
];

const TEST_NAMESPACE_OPTIONS = Array.from(new Set(TEST_ROWS.map((row) => row.namespace)));
const TEST_FLOW_OPTIONS = Array.from(new Set(TEST_ROWS.map((row) => row.flow))).map((flow) => ({
  id: flow,
  label: flow,
  description: flow,
}));

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'Id', description: 'Test identifier', visible: true, order: 1 },
  { id: 'namespace', label: 'Namespace', description: 'Namespace to which the test belongs', visible: true, order: 2 },
  { id: 'flow', label: 'Flow', description: 'ID of the tested flow', visible: true, order: 3 },
  { id: 'state', label: 'State', description: 'Latest test run state', visible: true, order: 4 },
  { id: 'run', label: 'Run', description: 'Start a test run', visible: true, order: 5 },
];

const operatorDisplay: Record<string, string> = {
  'in': 'in',
  'not-in': 'not in',
  'contains': 'contains',
  'starts-with': 'starts with',
  'ends-with': 'ends with',
};

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TEST_FILTER_OPTIONS: FilterOption[] = [
  { id: 'state', label: 'State', description: 'Filter by test run state', enabled: false, order: 1 },
  { id: 'namespace', label: 'Namespace', description: 'Filter by namespace', enabled: false, order: 2 },
  { id: 'flow', label: 'Flow', description: 'Filter by flow', enabled: false, order: 3 },
];

export default function TestsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statesOperator, setStatesOperator] = useState<string>('in');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState<string>('in');
  const [namespaceCustomValue, setNamespaceCustomValue] = useState<string>('');
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [flowOperator, setFlowOperator] = useState('in');
  const [flowCustomValue, setFlowCustomValue] = useState('');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS.map((col) => ({ ...col })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);

  // Additional state required by FilterInterface but not heavily used on Tests page
  const [selectedInterval, setSelectedInterval] = useState('last-7-days');
  const [intervalStartDate, setIntervalStartDate] = useState<string | undefined>();
  const [intervalEndDate, setIntervalEndDate] = useState<string | undefined>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState('has-any-of');
  const [labelsCustomValue, setLabelsCustomValue] = useState('');
  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);
  const [inputsOperator, setInputsOperator] = useState('has-any-of');
  const [inputsCustomValue, setInputsCustomValue] = useState('');
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);
  const [outputsOperator, setOutputsOperator] = useState('has-any-of');
  const [outputsCustomValue, setOutputsCustomValue] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['user']);
  const [selectedKinds, setSelectedKinds] = useState<string[]>(['default']);
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('all');
  const [selectedInitialExecution, setSelectedInitialExecution] = useState<string>('');
  const [periodicRefresh, setPeriodicRefresh] = useState(false);

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const loadedFilters = testsSavedFiltersStorage.getAll();
    setSavedFilters(loadedFilters);
  }, []);

  const filteredTests = useMemo(() => {
    return TEST_ROWS.filter((row) => {
      if (searchValue.trim()) {
        const needle = searchValue.trim().toLowerCase();
        const haystack = `${row.id} ${row.namespace} ${row.flow}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }

      if (selectedStates.length > 0) {
        if (statesOperator === 'in' && !selectedStates.includes(row.state)) {
          return false;
        }
        if (statesOperator === 'not-in' && selectedStates.includes(row.state)) {
          return false;
        }
      }

      if (namespaceOperator === 'in') {
        if (selectedNamespaces.length > 0 && !selectedNamespaces.includes(row.namespace)) {
          return false;
        }
      } else if (namespaceOperator === 'not-in') {
        if (selectedNamespaces.includes(row.namespace)) {
          return false;
        }
      } else if (namespaceOperator === 'contains') {
        if (!row.namespace.toLowerCase().includes(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      } else if (namespaceOperator === 'starts-with') {
        if (!row.namespace.toLowerCase().startsWith(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      } else if (namespaceOperator === 'ends-with') {
        if (!row.namespace.toLowerCase().endsWith(namespaceCustomValue.toLowerCase())) {
          return false;
        }
      }

      if (selectedFlows.length > 0 && !selectedFlows.includes(row.flow)) {
        return false;
      }

      return true;
    });
  }, [
    searchValue,
    selectedStates,
    statesOperator,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
  ]);

  const stateFilterValue = useMemo(() => {
    if (selectedStates.length === 0) return 'Any';
    if (selectedStates.length === 1) return selectedStates[0];
    return `${selectedStates.length} selected`;
  }, [selectedStates]);

  const namespaceFilterValue = useMemo(() => {
    if (['in', 'not-in'].includes(namespaceOperator)) {
      if (selectedNamespaces.length === 0) return 'Any';
      if (selectedNamespaces.length === 1) return selectedNamespaces[0];
      return `${selectedNamespaces.length} selected`;
    }

    if (!namespaceCustomValue.trim()) {
      return 'Any';
    }

    return namespaceCustomValue;
  }, [namespaceOperator, selectedNamespaces, namespaceCustomValue]);

  const flowFilterValue = useMemo(() => {
    if (selectedFlows.length === 0) return 'Any';
    if (selectedFlows.length === 1) return selectedFlows[0];
    return `${selectedFlows.length} selected`;
  }, [selectedFlows]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes('state')) {
      filters.push({
        id: 'state',
        label: 'State',
        value: stateFilterValue,
        operator: operatorDisplay[statesOperator] ?? statesOperator,
      });
    }

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

    return filters;
  }, [
    visibleFilters,
    stateFilterValue,
    statesOperator,
    namespaceFilterValue,
    namespaceOperator,
    flowFilterValue,
  ]);

  const handleClearFilter = (filterId: string) => {
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));

    if (filterId === 'state') {
      setSelectedStates([]);
      setStatesOperator('in');
    } else if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    }
  };

  const handleEditFilter = () => {
    // FilterInterface handles opening the popover, no-op here
  };

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const handleIntervalChange = (interval: string, startDate?: string, endDate?: string) => {
    setSelectedInterval(interval);
    setIntervalStartDate(startDate);
    setIntervalEndDate(endDate);
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setSelectedStates([]);
    setStatesOperator('in');
    setSelectedNamespaces([]);
    setNamespaceOperator('in');
    setNamespaceCustomValue('');
    setSelectedFlows([]);
    setSelectedInterval('last-7-days');
    setIntervalStartDate(undefined);
    setIntervalEndDate(undefined);
    setSelectedLabels([]);
    setLabelsOperator('has-any-of');
    setLabelsCustomValue('');
    setSelectedInputs([]);
    setInputsOperator('has-any-of');
    setInputsCustomValue('');
    setSelectedOutputs([]);
    setOutputsOperator('has-any-of');
    setOutputsCustomValue('');
    setSelectedScopes(['user']);
    setSelectedKinds(['default']);
    setSelectedHierarchy('all');
    setSelectedInitialExecution('');
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'state') {
      setSelectedStates([]);
      setStatesOperator('in');
    } else if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    }
  };

  const getCurrentFilterState = (): SavedFilter['filterState'] => ({
    searchValue,
    selectedStates,
    statesOperator,
    selectedInterval,
    intervalStartDate,
    intervalEndDate,
    selectedLabels,
    labelsOperator,
    labelsCustomValue,
    selectedInputs,
    inputsOperator,
    inputsCustomValue,
    selectedOutputs,
    outputsOperator,
    outputsCustomValue,
    selectedNamespaces,
    namespaceOperator,
    namespaceCustomValue,
    selectedFlows,
    selectedScopes,
    selectedKinds,
    selectedHierarchy,
    selectedInitialExecution,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const filterId = `filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    const newFilter: SavedFilter = {
      id: filterId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    testsSavedFiltersStorage.save(newFilter);
    setSavedFilters(testsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;

    setSearchValue(state.searchValue ?? '');
    setSelectedStates(state.selectedStates ?? []);
    setStatesOperator(state.statesOperator ?? 'in');
    setSelectedInterval(state.selectedInterval ?? 'last-7-days');
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setSelectedLabels(state.selectedLabels ?? []);
    setLabelsOperator(state.labelsOperator ?? 'has-any-of');
    setLabelsCustomValue(state.labelsCustomValue ?? '');
    setSelectedInputs(state.selectedInputs ?? []);
    setInputsOperator(state.inputsOperator ?? 'has-any-of');
    setInputsCustomValue(state.inputsCustomValue ?? '');
    setSelectedOutputs(state.selectedOutputs ?? []);
    setOutputsOperator(state.outputsOperator ?? 'has-any-of');
    setOutputsCustomValue(state.outputsCustomValue ?? '');
    setSelectedNamespaces(state.selectedNamespaces ?? []);
    setNamespaceOperator(state.namespaceOperator ?? 'in');
    setNamespaceCustomValue(state.namespaceCustomValue ?? '');
    setSelectedFlows(state.selectedFlows ?? []);
    setSelectedScopes(state.selectedScopes ?? ['user']);
    setSelectedKinds(state.selectedKinds ?? ['default']);
    setSelectedHierarchy(state.selectedHierarchy ?? 'all');
    setSelectedInitialExecution(state.selectedInitialExecution ?? '');

    const requiredFilters = new Set<string>(DEFAULT_VISIBLE_FILTERS);

    if ((state.selectedStates ?? []).length > 0) {
      requiredFilters.add('state');
    }
    if ((state.selectedNamespaces ?? []).length > 0 || (state.namespaceCustomValue ?? '').trim()) {
      requiredFilters.add('namespace');
    }
    if ((state.selectedFlows ?? []).length > 0) {
      requiredFilters.add('flow');
    }

    setVisibleFilters(Array.from(requiredFilters));
  };

  const handleDeleteFilter = (filterId: string) => {
    testsSavedFiltersStorage.delete(filterId);
    setSavedFilters(testsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    testsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(testsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing tests data...');
  };

  const handleRunTest = (testId: string) => {
    console.log(`Run test requested for ${testId}`);
  };

  return (
    <div className="min-h-screen bg-[#1F232D]">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">Tests</h1>
            <span className="text-sm text-muted-foreground">Validate your flows with comprehensive test suites</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Jump to...
            </button>
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
          selectedStates={selectedStates}
          statesOperator={statesOperator}
          onSelectedStatesChange={setSelectedStates}
          onStatesOperatorChange={setStatesOperator}
          selectedInterval={selectedInterval}
          intervalStartDate={intervalStartDate}
          intervalEndDate={intervalEndDate}
          onIntervalChange={handleIntervalChange}
          selectedLabels={selectedLabels}
          labelsOperator={labelsOperator}
          labelsCustomValue={labelsCustomValue}
          onLabelsSelectionChange={setSelectedLabels}
          onLabelsOperatorChange={setLabelsOperator}
          onLabelsCustomValueChange={setLabelsCustomValue}
          selectedInputs={selectedInputs}
          inputsOperator={inputsOperator}
          inputsCustomValue={inputsCustomValue}
          onInputsSelectionChange={setSelectedInputs}
          onInputsOperatorChange={setInputsOperator}
          onInputsCustomValueChange={setInputsCustomValue}
          selectedOutputs={selectedOutputs}
          outputsOperator={outputsOperator}
          outputsCustomValue={outputsCustomValue}
          onOutputsSelectionChange={setSelectedOutputs}
          onOutputsOperatorChange={setOutputsOperator}
          onOutputsCustomValueChange={setOutputsCustomValue}
          selectedNamespaces={selectedNamespaces}
          namespaceOperator={namespaceOperator}
          namespaceCustomValue={namespaceCustomValue}
          onNamespacesSelectionChange={setSelectedNamespaces}
          onNamespaceOperatorChange={setNamespaceOperator}
          onNamespaceCustomValueChange={setNamespaceCustomValue}
          namespaceOptions={TEST_NAMESPACE_OPTIONS}
          selectedFlows={selectedFlows}
          flowOperator={flowOperator}
          flowCustomValue={flowCustomValue}
          onFlowsSelectionChange={setSelectedFlows}
          onFlowOperatorChange={setFlowOperator}
          onFlowCustomValueChange={setFlowCustomValue}
          selectedScopes={selectedScopes}
          onScopesSelectionChange={setSelectedScopes}
          selectedKinds={selectedKinds}
          onKindsSelectionChange={setSelectedKinds}
          selectedHierarchy={selectedHierarchy}
          onHierarchySelectionChange={setSelectedHierarchy}
          selectedInitialExecution={selectedInitialExecution}
          onInitialExecutionSelectionChange={setSelectedInitialExecution}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          stateFilterOptions={TEST_STATE_OPTIONS}
          filterOptions={TEST_FILTER_OPTIONS}
          namespaceMode="tests"
          flowOptions={TEST_FLOW_OPTIONS}
          showChartToggleControl={false}
          searchPlaceholder="Search tests..."
        />

        <section className="p-6">
          <TestsTable tests={filteredTests} columns={columns} onRunTest={handleRunTest} />
        </section>
      </main>
    </div>
  );
}
