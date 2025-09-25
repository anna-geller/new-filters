import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import AuditLogsTable, { instanceAuditLogColumns, type AuditLogRow } from '@/components/AuditLogsTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { instanceAuditLogsSavedFiltersStorage } from '@/utils/instanceAuditLogsSavedFiltersStorage';
import { normalizeActionForFilter, detailsIncludeKeyValue } from '@/utils/auditLogFilterUtils';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const DEFAULT_VISIBLE_FILTERS = ['interval'];

const AUDIT_LOG_FILTER_OPTIONS: FilterOption[] = [
  { id: 'interval', label: 'Interval', description: 'Filter by when the action occurred', enabled: true, order: 1 },
  { id: 'actor', label: 'Actor', description: 'Filter by user or service account', enabled: true, order: 2 },
  { id: 'action', label: 'Action', description: 'Filter by action type', enabled: true, order: 3 },
  { id: 'resource', label: 'Resource', description: 'Filter by resource type', enabled: true, order: 4 },
  { id: 'details', label: 'Details', description: 'Filter by details key/value', enabled: true, order: 5 },
];

const INSTANCE_AUDIT_LOG_ROWS: AuditLogRow[] = [
  {
    id: 'instance-audit-1',
    resourceType: 'Worker Group',
    action: 'Deleted',
    actor: {
      label: 'anna@kestra.io',
      url: 'https://www.notion.so/kestra-io/anna@kestra.io',
    },
    details: 'type: io.kestra.ee.models.audits.details.WorkerGroupAuditLog\nid: 1ofuldKNdszpY1ZjTtYYm',
    date: '7 minutes ago',
    tenant: 'main',
  },
  {
    id: 'instance-audit-2',
    resourceType: 'Worker Group',
    action: 'Created',
    actor: {
      label: 'anna@kestra.io',
      url: 'https://www.notion.so/kestra-io/anna@kestra.io',
    },
    details: 'type: io.kestra.ee.models.audits.details.WorkerGroupAuditLog\nid: 1ofuldKNdszpY1ZjTtYYm',
    date: '9 minutes ago',
    tenant: 'main',
  },
  {
    id: 'instance-audit-3',
    resourceType: 'Secret',
    action: 'Updated',
    actor: {
      label: 'anna@kestra.io',
      url: 'https://www.notion.so/kestra-io/anna@kestra.io',
    },
    details: 'type: io.kestra.ee.models.audits.details.SecretAuditLog\nid: AWS_ACCESS_KEY_ID namespace: company',
    date: '7 hours ago',
    tenant: 'demo',
  },
];

export default function InstanceAuditLogsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('last-7-days');
  const [intervalStartDate, setIntervalStartDate] = useState<string>();
  const [intervalEndDate, setIntervalEndDate] = useState<string>();
  const [actorValue, setActorValue] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [actionsOperator, setActionsOperator] = useState<'in' | 'not-in'>('in');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resourcesOperator, setResourcesOperator] = useState<'in' | 'not-in'>('in');
  const [detailsKey, setDetailsKey] = useState('');
  const [detailsValue, setDetailsValue] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(instanceAuditLogColumns.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const stored = instanceAuditLogsSavedFiltersStorage.getAll();
    setSavedFilters(stored);
  }, []);

  const getIntervalDisplayValue = () => {
    if (selectedInterval === 'custom-range' && intervalStartDate && intervalEndDate) {
      return `${new Date(intervalStartDate).toLocaleDateString()} - ${new Date(intervalEndDate).toLocaleDateString()}`;
    }
    return selectedInterval
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  };

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes('interval')) {
      filters.push({
        id: 'interval',
        label: 'Interval',
        value: getIntervalDisplayValue(),
      });
    }

    if (visibleFilters.includes('actor') && actorValue.trim()) {
      filters.push({
        id: 'actor',
        label: 'Actor',
        value: actorValue.trim(),
        operator: 'matches',
      });
    }

    if (visibleFilters.includes('action') && selectedActions.length > 0) {
      filters.push({
        id: 'action',
        label: 'Action',
        value: `${selectedActions.length}`,
        operator: actionsOperator === 'not-in' ? 'not in' : 'in',
      });
    }

    if (visibleFilters.includes('resource') && selectedResources.length > 0) {
      filters.push({
        id: 'resource',
        label: 'Resource',
        value: `${selectedResources.length}`,
        operator: resourcesOperator === 'not-in' ? 'not in' : 'in',
      });
    }

    if (visibleFilters.includes('details') && detailsKey.trim() && detailsValue.trim()) {
      filters.push({
        id: 'details',
        label: 'Details',
        value: `${detailsKey.trim()}=${detailsValue.trim()}`,
        operator: 'matches',
      });
    }

    return filters;
  }, [
    visibleFilters,
    actorValue,
    selectedActions,
    actionsOperator,
    selectedResources,
    resourcesOperator,
    detailsKey,
    detailsValue,
    selectedInterval,
    intervalStartDate,
    intervalEndDate,
  ]);

  const handleIntervalChange = (interval: string, startDate?: string, endDate?: string) => {
    setSelectedInterval(interval);
    setIntervalStartDate(startDate);
    setIntervalEndDate(endDate);
  };

  const resetActionFilter = () => {
    setSelectedActions([]);
    setActionsOperator('in');
  };

  const resetResourceFilter = () => {
    setSelectedResources([]);
    setResourcesOperator('in');
  };

  const resetDetailsFilter = () => {
    setDetailsKey('');
    setDetailsValue('');
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'interval') {
      setSelectedInterval('last-7-days');
      setIntervalStartDate(undefined);
      setIntervalEndDate(undefined);
    } else if (filterId === 'actor') {
      setActorValue('');
    } else if (filterId === 'action') {
      resetActionFilter();
    } else if (filterId === 'resource') {
      resetResourceFilter();
    } else if (filterId === 'details') {
      resetDetailsFilter();
    }
  };

  const handleClearFilter = (filterId: string) => {
    handleResetFilter(filterId);
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const buildVisibleFiltersFromState = (state: SavedFilter['filterState']) => {
    if (state.visibleFilters && state.visibleFilters.length > 0) {
      return Array.from(new Set(state.visibleFilters));
    }

    const required = new Set<string>();
    required.add('interval');
    if (state.actorValue && state.actorValue.trim()) {
      required.add('actor');
    }
    if (state.selectedActions && state.selectedActions.length > 0) {
      required.add('action');
    }
    if (state.selectedResources && state.selectedResources.length > 0) {
      required.add('resource');
    }
    if (state.detailsKey && state.detailsValue) {
      required.add('details');
    }

    return Array.from(required);
  };

  const getCurrentFilterState = (): SavedFilter['filterState'] => ({
    searchValue,
    selectedStates: [],
    statesOperator: 'in',
    selectedInterval,
    intervalStartDate,
    intervalEndDate,
    selectedLabels: [],
    labelsOperator: 'has-any-of',
    labelsCustomValue: '',
    selectedNamespaces: [],
    selectedFlows: [],
    selectedScopes: [],
    selectedKinds: [],
    selectedHierarchy: 'all',
    selectedInitialExecution: '',
    actorValue,
    selectedActions,
    actionsOperator,
    selectedResources,
    resourcesOperator,
    detailsKey,
    detailsValue,
    visibleFilters,
  });

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const newFilter: SavedFilter = {
      id: `instance-audit-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: getCurrentFilterState(),
    };

    instanceAuditLogsSavedFiltersStorage.save(newFilter);
    setSavedFilters(instanceAuditLogsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue);
    setSelectedInterval(state.selectedInterval);
    setIntervalStartDate(state.intervalStartDate);
    setIntervalEndDate(state.intervalEndDate);
    setActorValue(state.actorValue ?? '');
    setSelectedActions(state.selectedActions ?? []);
    setActionsOperator((state.actionsOperator as 'in' | 'not-in') || 'in');
    setSelectedResources(state.selectedResources ?? []);
    setResourcesOperator((state.resourcesOperator as 'in' | 'not-in') || 'in');
    setDetailsKey(state.detailsKey ?? '');
    setDetailsValue(state.detailsValue ?? '');

    const derivedVisibleFilters = buildVisibleFiltersFromState(state);
    setVisibleFilters(derivedVisibleFilters.length > 0 ? derivedVisibleFilters : ['interval']);
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceAuditLogsSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceAuditLogsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceAuditLogsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceAuditLogsSavedFiltersStorage.getAll());
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setSelectedInterval('last-7-days');
    setIntervalStartDate(undefined);
    setIntervalEndDate(undefined);
    setActorValue('');
    resetActionFilter();
    resetResourceFilter();
    resetDetailsFilter();
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(instanceAuditLogColumns.map((column) => ({ ...column })));
    setShowChart(false);
    setPeriodicRefresh(true);
  };

  const handleDetailsChange = (key: string, value: string) => {
    setDetailsKey(key);
    setDetailsValue(value);
  };

  const handleToggleShowChart = (enabled: boolean) => {
    setShowChart(enabled);
  };

  const handleTogglePeriodicRefresh = (enabled: boolean) => {
    setPeriodicRefresh(enabled);
  };

  const handleRefreshData = () => {
    console.log('Refreshing instance audit logs data...');
  };

  const handleColumnsChange = (nextColumns: ColumnConfig[]) => {
    setColumns(nextColumns);
  };

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const actorTerm = actorValue.trim().toLowerCase();
    const detailsKeyTrimmed = detailsKey.trim();
    const detailsValueTrimmed = detailsValue.trim();
    const actionSet = new Set(selectedActions.map(normalizeActionForFilter));
    const resourceSet = new Set(selectedResources.map(resource => resource.toLowerCase()));

    return INSTANCE_AUDIT_LOG_ROWS.filter(row => {
      if (searchTerm) {
        const haystack = `${row.resourceType} ${row.action} ${row.actor.label} ${row.details} ${row.tenant ?? ''}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (actorTerm && !row.actor.label.toLowerCase().includes(actorTerm)) {
        return false;
      }

      if (actionSet.size > 0) {
        const normalizedAction = normalizeActionForFilter(row.action);
        if (actionsOperator === 'in') {
          if (!actionSet.has(normalizedAction)) {
            return false;
          }
        } else if (actionSet.has(normalizedAction)) {
          return false;
        }
      }

      if (resourceSet.size > 0) {
        const resourceValue = row.resourceType.toLowerCase();
        if (resourcesOperator === 'in') {
          if (!resourceSet.has(resourceValue)) {
            return false;
          }
        } else if (resourceSet.has(resourceValue)) {
          return false;
        }
      }

      if (detailsKeyTrimmed && detailsValueTrimmed) {
        if (!detailsIncludeKeyValue(row.details, detailsKeyTrimmed, detailsValueTrimmed)) {
          return false;
        }
      }

      return true;
    });
  }, [
    searchValue,
    actorValue,
    selectedActions,
    actionsOperator,
    selectedResources,
    resourcesOperator,
    detailsKey,
    detailsValue,
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Audit Logs</h1>
            <span className="text-sm text-muted-foreground">Instance Administration</span>
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
          onClearFilter={handleClearFilter}
          onEditFilter={() => {}}
          onResetFilters={handleResetFilters}
          showChart={showChart}
          onToggleShowChart={handleToggleShowChart}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={handleTogglePeriodicRefresh}
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          selectedInterval={selectedInterval}
          intervalStartDate={intervalStartDate}
          intervalEndDate={intervalEndDate}
          onIntervalChange={handleIntervalChange}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
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
          actorValue={actorValue}
          onActorChange={setActorValue}
          selectedActions={selectedActions}
          actionsOperator={actionsOperator}
          onActionsSelectionChange={setSelectedActions}
          onActionsOperatorChange={setActionsOperator}
          selectedResources={selectedResources}
          resourcesOperator={resourcesOperator}
          onResourcesSelectionChange={setSelectedResources}
          onResourcesOperatorChange={setResourcesOperator}
          detailsKey={detailsKey}
          detailsValue={detailsValue}
          onDetailsChange={handleDetailsChange}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={AUDIT_LOG_FILTER_OPTIONS}
          searchPlaceholder="Search audit logs..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <AuditLogsTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
