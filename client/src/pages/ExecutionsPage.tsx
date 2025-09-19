import { useState, useEffect, useMemo } from 'react';
import FilterInterface from '@/components/FilterInterface';
import ExecutionsTable, { ColumnConfig, defaultColumns } from '@/components/ExecutionsTable';
import ExecutionChart from '@/components/ExecutionChart';
import { SavedFilter } from '@/types/savedFilters';
import { savedFiltersStorage } from '@/utils/savedFiltersStorage';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

// todo: remove mock functionality
const mockExecutions = [
  {
    id: 'a1b2c3d4',
    startDate: 'Thu, Jul 24, 2025 3:38 PM',
    endDate: 'Thu, Jul 24, 2025 3:38 PM',
    duration: '0.1s',
    namespace: 'company',
    flow: 'myflow',
    labels: ['dev-production', 'team-backend'],
    revision: '1',
    inputs: ['customer_id:98213', 'region:us-east-1', 'priority:high'],
    outputs: ['status:success', 'records_processed:4201', 'duration_ms:3150'],
    taskId: 'finalize-report',
    state: 'SUCCESS' as const
  },
  {
    id: 'b2c3d4e5',
    startDate: 'Thu, Jul 24, 2025 3:37 PM',
    endDate: 'Thu, Jul 24, 2025 3:38 PM',
    duration: '1.5s',
    namespace: 'company.team',
    flow: 'myflow',
    labels: ['dev-production', 'team-backend'],
    revision: '2',
    inputs: ['customer_id:10342', 'feature_flag:new-filters'],
    outputs: ['status:failed', 'error_code:timeout'],
    taskId: 'resolve-dependencies',
    state: 'FAILED' as const
  },
  {
    id: 'c3d4e5f6',
    startDate: 'Thu, Jul 24, 2025 3:36 PM',
    endDate: 'Thu, Jul 24, 2025 3:37 PM',
    duration: '2.1s',
    namespace: 'company.team.backend',
    flow: 'myflow',
    labels: ['dev-production', 'team-backend'],
    revision: '1',
    inputs: ['correlation_id:12ab-45cd', 'trigger:api'],
    outputs: ['status:running', 'records_processed:128'],
    taskId: 'aggregate-events',
    state: 'RUNNING' as const
  },
  {
    id: 'd4e5f6g7',
    startDate: 'Thu, Jul 24, 2025 3:35 PM',
    endDate: 'Thu, Jul 24, 2025 3:36 PM',
    duration: '0.4s',
    namespace: 'company.team.frontend',
    flow: 'myflow',
    labels: ['dev-production', 'team-frontend'],
    revision: '4',
    inputs: ['dataset:daily-sync', 'retry_count:0'],
    outputs: ['status:queued', 'records_processed:0'],
    taskId: 'queue-run',
    state: 'QUEUED' as const
  },
  {
    id: 'e5f6g7h8',
    startDate: 'Thu, Jul 24, 2025 3:34 PM',
    endDate: 'Thu, Jul 24, 2025 3:35 PM',
    duration: '3.2s',
    namespace: 'company.team.api',
    flow: 'myflow',
    labels: ['dev-production', 'team-analytics'],
    revision: '5',
    inputs: ['source:cli', 'plan:enterprise'],
    outputs: ['status:warning', 'alerts_sent:true'],
    taskId: 'notify-observers',
    state: 'WARNING' as const
  },
  {
    id: 'f6g7h8i9',
    startDate: 'Thu, Jul 24, 2025 3:33 PM',
    endDate: 'Thu, Jul 24, 2025 3:34 PM',
    duration: '0.8s',
    namespace: 'company.team.database',
    flow: 'myflow',
    labels: ['dev-production', 'team-analytics'],
    revision: '6',
    inputs: ['source:cli', 'retry_count:0'],
    outputs: ['status:paused', 'retry_scheduled:false'],
    taskId: 'pause-checkpoint',
    state: 'PAUSED' as const
  },
  {
    id: 'g7h8i9j0',
    startDate: 'Thu, Jul 24, 2025 3:32 PM',
    endDate: 'Thu, Jul 24, 2025 3:33 PM',
    duration: '1.1s',
    namespace: 'company.analytics',
    flow: 'myflow',
    labels: ['dev-production', 'team-analytics'],
    revision: '7',
    inputs: ['dataset:daily-sync', 'priority:high'],
    outputs: ['status:created', 'records_processed:0'],
    taskId: 'create-run-record',
    state: 'CREATED' as const
  },
  {
    id: 'h8i9j0k1',
    startDate: 'Thu, Jul 24, 2025 3:31 PM',
    endDate: 'Thu, Jul 24, 2025 3:32 PM',
    duration: '1.4s',
    namespace: 'company.security',
    flow: 'security-scan',
    labels: ['security-scan', 'team-security'],
    revision: '8',
    inputs: ['customer_id:98213', 'trigger:api'],
    outputs: ['status:restarted', 'records_failed:1'],
    taskId: 'restart-checkpoint',
    state: 'RESTARTED' as const
  },
  {
    id: 'i9j0k1l2',
    startDate: 'Thu, Jul 24, 2025 3:30 PM',
    endDate: 'Thu, Jul 24, 2025 3:31 PM',
    duration: '1.4s',
    namespace: 'company.security',
    flow: 'security-scan',
    labels: ['security-scan', 'team-security'],
    revision: '9',
    inputs: ['customer_id:10342', 'priority:high'],
    outputs: ['status:cancelled', 'alerts_sent:false'],
    taskId: 'cancel-run',
    state: 'CANCELLED' as const
  }
];

export default function ExecutionsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statesOperator, setStatesOperator] = useState<string>('in');
  const [selectedInterval, setSelectedInterval] = useState('last-7-days');
  const [intervalStartDate, setIntervalStartDate] = useState<string>();
  const [intervalEndDate, setIntervalEndDate] = useState<string>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState('has-any-of');
  const [labelsCustomValue, setLabelsCustomValue] = useState('');
  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);
  const [inputsOperator, setInputsOperator] = useState('has-any-of');
  const [inputsCustomValue, setInputsCustomValue] = useState('');
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);
  const [outputsOperator, setOutputsOperator] = useState('has-any-of');
  const [outputsCustomValue, setOutputsCustomValue] = useState('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState('in');
  const [namespaceCustomValue, setNamespaceCustomValue] = useState('');
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['user']);
  const [selectedKinds, setSelectedKinds] = useState<string[]>(['default']);
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('all');
  const [selectedInitialExecution, setSelectedInitialExecution] = useState<string>('');
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  
  // Saved filters state
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Visible filters state - tracks which filters should be displayed
  const [visibleFilters, setVisibleFilters] = useState<string[]>(['scope', 'kind', 'hierarchy', 'interval']);

  // Load saved filters on component mount
  useEffect(() => {
    const loadedFilters = savedFiltersStorage.getAll();
    setSavedFilters(loadedFilters);
  }, []);
  
  // Helper function to get display value for interval
  const getIntervalDisplayValue = () => {
    if (selectedInterval === 'custom-range' && intervalStartDate && intervalEndDate) {
      return `${new Date(intervalStartDate).toLocaleDateString()} - ${new Date(intervalEndDate).toLocaleDateString()}`;
    }
    // Convert kebab-case to readable format
    return selectedInterval.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Dynamically compute active filters from current state
  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    // Only include filters that are in visibleFilters array
    
    // Scope filter (if visible)
    if (visibleFilters.includes('scope')) {
      const scopeDisplayValue = selectedScopes.length === 2 && selectedScopes.includes('user') && selectedScopes.includes('system')
        ? 'All'
        : selectedScopes.length === 1
        ? selectedScopes[0] === 'user' ? 'User' : 'System'
        : selectedScopes.length > 0
        ? `${selectedScopes.length} selected`
        : 'None';
      
      filters.push({
        id: 'scope',
        label: 'Scope',
        value: scopeDisplayValue
      });
    }

    // Kind filter (if visible)
    if (visibleFilters.includes('kind')) {
      const kindDisplayValue = selectedKinds.length === 1 && selectedKinds[0] === 'default'
        ? 'Default'
        : selectedKinds.length === 1
        ? selectedKinds[0].charAt(0).toUpperCase() + selectedKinds[0].slice(1)
        : selectedKinds.length > 0
        ? `${selectedKinds.length} selected`
        : 'None';
      
      filters.push({
        id: 'kind',
        label: 'Kind',
        value: kindDisplayValue
      });
    }

    // Hierarchy filter (if visible)
    if (visibleFilters.includes('hierarchy')) {
      const hierarchyDisplayValue = selectedHierarchy === 'all'
        ? 'All'
        : selectedHierarchy === 'parent'
        ? 'Parent'
        : selectedHierarchy === 'child'
        ? 'Child'
        : selectedHierarchy;
      
      filters.push({
        id: 'hierarchy',
        label: 'Hierarchy',
        value: hierarchyDisplayValue
      });
    }

    // Interval filter (if visible)
    if (visibleFilters.includes('interval')) {
      filters.push({
        id: 'interval',
        label: 'Interval',
        value: getIntervalDisplayValue()
      });
    }

    return filters;
  }, [visibleFilters, selectedScopes, selectedKinds, selectedHierarchy, selectedInterval, intervalStartDate, intervalEndDate]);
  
  // Helper function to get short operator label for display
  const getOperatorDisplayLabel = (operatorId: string) => {
    const operatorMap = {
      'has-any-of': 'has any of',
      'has-none-of': 'has none of',
      'has-all-of': 'has all of',
      'contains': 'contains',
      'does-not-contain': 'does not contain',
      'is-set': 'is set',
      'is-not-set': 'is not set'
    };
    return operatorMap[operatorId as keyof typeof operatorMap] || operatorId;
  };

  // Build additional filters from current state (only if visible)
  const additionalFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];
  
    // Add state filter if states are selected AND visible
    if (visibleFilters.includes('state') && selectedStates.length > 0) {
      const operatorLabels = {
        'in': 'in',
        'not-in': 'not in'
      };
      const stateFilter = {
        id: 'state',
        label: 'State',
        value: `${selectedStates.length}`,
        operator: operatorLabels[statesOperator as keyof typeof operatorLabels]
      };
      filters.push(stateFilter);
    }

    // Add labels filter if labels are selected, custom value is set, or no-input operator is used AND visible
    const isTextBasedLabelsOperator = ['contains', 'does-not-contain'].includes(labelsOperator);
    const isNoInputLabelsOperator = ['is-set', 'is-not-set'].includes(labelsOperator);
    const isSelectionBasedLabelsOperator = ['has-any-of', 'has-none-of', 'has-all-of'].includes(labelsOperator);
    
    if (visibleFilters.includes('labels') && ((isTextBasedLabelsOperator && labelsCustomValue.trim()) || 
        (isSelectionBasedLabelsOperator && selectedLabels.length > 0) || 
        isNoInputLabelsOperator)) {
      const labelsFilter = {
        id: 'labels',
        label: 'Labels',
        value: isTextBasedLabelsOperator 
          ? labelsCustomValue 
          : isNoInputLabelsOperator 
          ? labelsCustomValue || (labelsOperator === 'is-set' ? 'any' : 'none')
          : `${selectedLabels.length}`,
        operator: getOperatorDisplayLabel(labelsOperator)
      };
      filters.push(labelsFilter);
    }

    const isTextBasedInputsOperator = ['contains', 'does-not-contain'].includes(inputsOperator);
    const isNoInputInputsOperator = ['is-set', 'is-not-set'].includes(inputsOperator);
    const isSelectionBasedInputsOperator = ['has-any-of', 'has-none-of', 'has-all-of'].includes(inputsOperator);

    if (
      visibleFilters.includes('inputs') &&
      ((isTextBasedInputsOperator && inputsCustomValue.trim()) ||
        (isSelectionBasedInputsOperator && selectedInputs.length > 0) ||
        isNoInputInputsOperator)
    ) {
      const inputsFilter = {
        id: 'inputs',
        label: 'Inputs',
        value: isTextBasedInputsOperator
          ? inputsCustomValue
          : isNoInputInputsOperator
          ? inputsCustomValue || (inputsOperator === 'is-set' ? 'any' : 'none')
          : `${selectedInputs.length}`,
        operator: getOperatorDisplayLabel(inputsOperator),
      };
      filters.push(inputsFilter);
    }

    const isTextBasedOutputsOperator = ['contains', 'does-not-contain'].includes(outputsOperator);
    const isNoInputOutputsOperator = ['is-set', 'is-not-set'].includes(outputsOperator);
    const isSelectionBasedOutputsOperator = ['has-any-of', 'has-none-of', 'has-all-of'].includes(outputsOperator);

    if (
      visibleFilters.includes('outputs') &&
      ((isTextBasedOutputsOperator && outputsCustomValue.trim()) ||
        (isSelectionBasedOutputsOperator && selectedOutputs.length > 0) ||
        isNoInputOutputsOperator)
    ) {
      const outputsFilter = {
        id: 'outputs',
        label: 'Outputs',
        value: isTextBasedOutputsOperator
          ? outputsCustomValue
          : isNoInputOutputsOperator
          ? outputsCustomValue || (outputsOperator === 'is-set' ? 'any' : 'none')
          : `${selectedOutputs.length}`,
        operator: getOperatorDisplayLabel(outputsOperator),
      };
      filters.push(outputsFilter);
    }

    // Add namespace filter if namespaces are selected or text value is provided AND visible
    const isTextBasedOperator = ['contains', 'starts-with', 'ends-with'].includes(namespaceOperator);
    const hasTextValue = isTextBasedOperator && namespaceCustomValue.trim();
    const hasSelectedNamespaces = selectedNamespaces.length > 0;
    
    if (visibleFilters.includes('namespace') && (hasSelectedNamespaces || hasTextValue)) {
      const operatorLabels = {
        'in': 'in',
        'not-in': 'not in', 
        'contains': 'contains',
        'starts-with': 'starts with',
        'ends-with': 'ends with'
      };
      
      const namespaceFilter = {
        id: 'namespace',
        label: 'Namespace',
        value: isTextBasedOperator 
          ? `"${namespaceCustomValue}"` 
          : `${selectedNamespaces.length}`,
        operator: operatorLabels[namespaceOperator as keyof typeof operatorLabels] || namespaceOperator
      };
      filters.push(namespaceFilter);
    }

    // Add flow filter if flows are selected AND visible
    if (visibleFilters.includes('flow') && selectedFlows.length > 0) {
      const flowFilter = {
        id: 'flow',
        label: 'Flow',
        value: `${selectedFlows.length}`,
        operator: 'in'
      };
      filters.push(flowFilter);
    }

    // Add parent execution filter if value is entered AND visible
    if (visibleFilters.includes('initial-execution') && selectedInitialExecution.trim() !== '') {
      const parentExecutionFilter = {
        id: 'initial-execution',
        label: 'Parent',
        value: selectedInitialExecution.trim(),
        operator: 'equals'
      };
      filters.push(parentExecutionFilter);
    }

    return filters;
  }, [
    visibleFilters,
    selectedStates,
    statesOperator,
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
    selectedInitialExecution,
  ]);
  
  // Combine all active filters
  const allActiveFilters = [...additionalFilters, ...activeFilters];

  const handleClearFilter = (filterId: string) => {
    // Remove filter from visibleFilters array to hide it completely
    setVisibleFilters(prev => prev.filter(id => id !== filterId));
    
    // Also reset the filter's values for consistency
    if (filterId === 'state') {
      setSelectedStates([]);
      setStatesOperator('in');
    } else if (filterId === 'labels') {
      setSelectedLabels([]);
      setLabelsCustomValue('');
      setLabelsOperator('has-any-of');
    } else if (filterId === 'inputs') {
      setSelectedInputs([]);
      setInputsCustomValue('');
      setInputsOperator('has-any-of');
    } else if (filterId === 'outputs') {
      setSelectedOutputs([]);
      setOutputsCustomValue('');
      setOutputsOperator('has-any-of');
    } else if (filterId === 'namespace') {
      setSelectedNamespaces([]);
      setNamespaceOperator('in');
      setNamespaceCustomValue('');
    } else if (filterId === 'flow') {
      setSelectedFlows([]);
    } else if (filterId === 'scope') {
      setSelectedScopes(['user']); // Reset to default
    } else if (filterId === 'kind') {
      setSelectedKinds(['default']); // Reset to default
    } else if (filterId === 'hierarchy') {
      setSelectedHierarchy('all'); // Reset to default
    } else if (filterId === 'initial-execution') {
      setSelectedInitialExecution('');
    } else if (filterId === 'interval') {
      // For interval, reset to default
      setSelectedInterval('last-7-days');
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    }
    
    console.log(`Removed filter from visible filters: ${filterId}`);
  };

  const handleEditFilter = (filterId: string) => {
    console.log(`Editing filter: ${filterId}`);
  };

  const handleRefreshData = () => {
    console.log('Refreshing execution data...');
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
    // Reset search to empty
    setSearchValue('');
    // Reset visible filters to default 4 (restore initial page load state)
    setVisibleFilters(['scope', 'kind', 'hierarchy', 'interval']);
    
    // Reset default filters to their default values
    setSelectedScopes(['user']);
    setSelectedKinds(['default']);
    setSelectedHierarchy('all');
    setSelectedInterval('last-7-days');
    setIntervalStartDate(undefined);
    setIntervalEndDate(undefined);
    
    // Clear non-default filters (they will be hidden anyway)
    setSelectedStates([]);
   setStatesOperator('in');
   setSelectedLabels([]);
   setLabelsOperator('has-any-of');
   setLabelsCustomValue('');
    setSelectedInputs([]);
    setInputsOperator('has-any-of');
    setInputsCustomValue('');
    setSelectedOutputs([]);
    setOutputsOperator('has-any-of');
    setOutputsCustomValue('');
    setSelectedNamespaces([]);
    setNamespaceOperator('in');
    setNamespaceCustomValue('');
    setSelectedFlows([]);
    setSelectedInitialExecution('');
    
    console.log('All filters reset to initial page load state');
  };

  // Individual filter reset function - different behavior for default vs non-default filters
  const handleResetFilter = (filterId: string) => {
    const defaultFilters = ['scope', 'kind', 'hierarchy', 'interval'];
    
    if (defaultFilters.includes(filterId)) {
      // Default filters: reset to default values
      if (filterId === 'scope') {
        setSelectedScopes(['user']);
      } else if (filterId === 'kind') {
        setSelectedKinds(['default']);
      } else if (filterId === 'hierarchy') {
        setSelectedHierarchy('all');
      } else if (filterId === 'interval') {
        setSelectedInterval('last-7-days');
        setIntervalStartDate(undefined);
        setIntervalEndDate(undefined);
      }
      console.log(`Reset default filter ${filterId} to default value`);
    } else {
      // Non-default filters: clear values but keep filter visible
      if (filterId === 'state') {
        setSelectedStates([]);
        setStatesOperator('in');
      } else if (filterId === 'labels') {
        setSelectedLabels([]);
        setLabelsCustomValue('');
        setLabelsOperator('has-any-of');
      } else if (filterId === 'inputs') {
        setSelectedInputs([]);
        setInputsCustomValue('');
        setInputsOperator('has-any-of');
      } else if (filterId === 'outputs') {
        setSelectedOutputs([]);
        setOutputsCustomValue('');
        setOutputsOperator('has-any-of');
      } else if (filterId === 'namespace') {
        setSelectedNamespaces([]);
        setNamespaceOperator('in');
        setNamespaceCustomValue('');
      } else if (filterId === 'flow') {
        setSelectedFlows([]);
      } else if (filterId === 'initial-execution') {
        setSelectedInitialExecution('');
      }
      console.log(`Reset non-default filter ${filterId} to empty state but kept visible`);
    }
  };

  // Get current filter state for saving
  const getCurrentFilterState = (): SavedFilter['filterState'] => {
    return {
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
    };
  };

  // Save current filter state
  const handleSaveFilter = (name: string, description: string) => {
    const filterId = `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newFilter: SavedFilter = {
      id: filterId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    savedFiltersStorage.save(newFilter);
    const updatedFilters = savedFiltersStorage.getAll();
    setSavedFilters(updatedFilters);
    console.log('Filter saved:', name);
  };

  // Normalize legacy operators to new ones
  const normalizeLegacyOperator = (operator: string, customValue: string) => {
    const operatorMigrations: { [key: string]: string } = {
      'in': 'has-any-of',
      'not-in': 'has-none-of', 
      'starts-with': 'contains',
      'ends-with': 'contains',
      'exactly-matches': 'contains'
    };
    
    const newOperator = operatorMigrations[operator] || operator;
    
    // For text-based operators that became selection-based, clear custom value
    const shouldClearCustomValue = ['in', 'not-in'].includes(operator) && customValue;
    
    return {
      operator: newOperator,
      customValue: shouldClearCustomValue ? '' : customValue
    };
  };

  // Load a saved filter
  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    
    // Normalize legacy labels operator
    const normalizedLabels = normalizeLegacyOperator(state.labelsOperator, state.labelsCustomValue || '');
    const normalizedInputs = normalizeLegacyOperator(state.inputsOperator || 'has-any-of', state.inputsCustomValue || '');
    const normalizedOutputs = normalizeLegacyOperator(state.outputsOperator || 'has-any-of', state.outputsCustomValue || '');
    
    // Phase 1: Determine which filters need to be visible based on saved state
    const requiredFilters = new Set<string>();
    
    // Always include default filters
    requiredFilters.add('scope');
    requiredFilters.add('kind');
    requiredFilters.add('hierarchy');
    requiredFilters.add('interval');
    
    // Check for non-default filters that have meaningful values
    if (state.selectedStates && state.selectedStates.length > 0) {
      requiredFilters.add('state');
    }
    
    if (state.selectedLabels && state.selectedLabels.length > 0) {
      requiredFilters.add('labels');
    }
    
    if ((normalizedLabels.customValue && normalizedLabels.customValue.trim()) || 
        ['is-set', 'is-not-set'].includes(normalizedLabels.operator)) {
      requiredFilters.add('labels');
    }

    if (state.selectedInputs && state.selectedInputs.length > 0) {
      requiredFilters.add('inputs');
    }

    if ((normalizedInputs.customValue && normalizedInputs.customValue.trim()) ||
        ['is-set', 'is-not-set'].includes(normalizedInputs.operator)) {
      requiredFilters.add('inputs');
    }

    if (state.selectedOutputs && state.selectedOutputs.length > 0) {
      requiredFilters.add('outputs');
    }

    if ((normalizedOutputs.customValue && normalizedOutputs.customValue.trim()) ||
        ['is-set', 'is-not-set'].includes(normalizedOutputs.operator)) {
      requiredFilters.add('outputs');
    }
    
    if (state.selectedNamespaces && state.selectedNamespaces.length > 0) {
      requiredFilters.add('namespace');
    }
    
    if (state.namespaceCustomValue && state.namespaceCustomValue.trim()) {
      requiredFilters.add('namespace');
    }
    
    if (state.selectedFlows && state.selectedFlows.length > 0) {
      requiredFilters.add('flow');
    }
    
    if (state.selectedInitialExecution?.trim() && state.selectedInitialExecution.trim() !== 'all') {
      requiredFilters.add('initial-execution');
    }
    
    // Phase 2: Update visible filters to include all required filters
    const newVisibleFilters = Array.from(requiredFilters);
    setVisibleFilters(newVisibleFilters);
    
    // Phase 3: Apply all saved filter values
    setSearchValue(state.searchValue);
    setSelectedStates(state.selectedStates);
    setStatesOperator(state.statesOperator || 'in');
    setSelectedInterval(state.selectedInterval);
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setSelectedLabels(state.selectedLabels);
    setLabelsOperator(normalizedLabels.operator);
    setLabelsCustomValue(normalizedLabels.customValue);
    setSelectedInputs(state.selectedInputs || []);
    setInputsOperator(normalizedInputs.operator || 'has-any-of');
    setInputsCustomValue(normalizedInputs.customValue || '');
    setSelectedOutputs(state.selectedOutputs || []);
    setOutputsOperator(normalizedOutputs.operator || 'has-any-of');
    setOutputsCustomValue(normalizedOutputs.customValue || '');
    setSelectedNamespaces(state.selectedNamespaces);
    setNamespaceOperator(state.namespaceOperator || 'in');
    setNamespaceCustomValue(state.namespaceCustomValue || '');
    setSelectedFlows(state.selectedFlows);
    
    // Normalize legacy scope values
    let normalizedScopes = state.selectedScopes || [];
    if (normalizedScopes.includes('all') || (normalizedScopes.length === 1 && normalizedScopes[0] === 'all')) {
      normalizedScopes = ['user', 'system'];
    }
    // Ensure only valid scope values
    normalizedScopes = normalizedScopes.filter(scope => scope === 'user' || scope === 'system');
    
    setSelectedScopes(normalizedScopes);
    setSelectedKinds(state.selectedKinds);
    setSelectedHierarchy(state.selectedHierarchy || 'all');
    setSelectedInitialExecution(state.selectedInitialExecution);
    
    console.log('Filter loaded:', filter.name);
  };

  // Delete a saved filter
  const handleDeleteFilter = (filterId: string) => {
    savedFiltersStorage.delete(filterId);
    const updatedFilters = savedFiltersStorage.getAll();
    setSavedFilters(updatedFilters);
    console.log('Filter deleted:', filterId);
  };

  // Update saved filter metadata
  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    savedFiltersStorage.update(filterId, { name, description });
    const updatedFilters = savedFiltersStorage.getAll();
    setSavedFilters(updatedFilters);
    console.log('Filter updated:', filterId);
  };

  // Handle label click from table - add to Labels filter with 'has-all-of' operator using logical AND
  const handleLabelClick = (clickedLabel: string) => {
    // Transform clicked label to match LabelsFilterEditor format
    let transformedLabel = clickedLabel;
    if (clickedLabel.startsWith('team-')) {
      transformedLabel = clickedLabel.replace('team-', 'team:');
    } else if (clickedLabel === 'dev-production') {
      transformedLabel = 'env:production';
    } else if (clickedLabel === 'security-scan') {
      transformedLabel = 'action:cvescan';
    }
    
    // Make sure Labels filter is visible
    if (!visibleFilters.includes('labels')) {
      setVisibleFilters(prev => [...prev, 'labels']);
    }
    
    // Set operator to 'has-all-of' as specified in requirements
    setLabelsOperator('has-all-of');
    
    // Use logical AND - add to existing selectedLabels (don't replace)
    setSelectedLabels(prevLabels => {
      if (!prevLabels.includes(transformedLabel)) {
        return [...prevLabels, transformedLabel];
      }
      return prevLabels; // Don't add duplicates
    });
    
    // Clear custom value since we're using selection-based operator
    setLabelsCustomValue('');
    
    console.log('Label clicked:', clickedLabel, '-> transformed to:', transformedLabel, '- added to Labels filter with has-all-of operator');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Executions</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Jump to...
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Ctrl+Cmd+K</span>
            </div>
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover-elevate">
              Execute
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Filter Interface */}
        <FilterInterface
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilters={allActiveFilters}
          onClearFilter={handleClearFilter}
          onEditFilter={handleEditFilter}
          onResetFilters={handleResetFilters}
          showChart={showChart}
          onToggleShowChart={setShowChart}
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
          selectedFlows={selectedFlows}
          onFlowsSelectionChange={setSelectedFlows}
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
        />

        {/* Chart - displayed when Show Chart toggle is enabled */}
        {showChart && (
          <ExecutionChart executions={mockExecutions} />
        )}

        {/* Table */}
        <div className="p-4">
          <ExecutionsTable 
            executions={mockExecutions} 
            columns={columns}
            onLabelClick={handleLabelClick}
          />
        </div>

      </main>
    </div>
  );
}
