import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import UsersTable, { type UserRow } from '@/components/UsersTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { tenantServiceAccountsSavedFiltersStorage } from '@/utils/tenantServiceAccountsSavedFiltersStorage';

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_SERVICE_ACCOUNTS_FILTER_OPTIONS: FilterOption[] = [
  { id: 'user', label: 'Name', description: 'Filter by service account name', enabled: false, order: 1 },
];

const TENANT_SERVICE_ACCOUNTS_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'Id', description: 'Unique identifier for the service account', visible: true, order: 1 },
  { id: 'name', label: 'Name', description: 'Display name of the service account', visible: true, order: 2 },
  { id: 'description', label: 'Description', description: 'Description of the service account', visible: true, order: 3 },
  { id: 'groups', label: 'Groups', description: 'Group memberships', visible: true, order: 4 },
];

const TENANT_SERVICE_ACCOUNT_ROWS: UserRow[] = [
  {
    id: 'xsoTLT2K',
    username: 'mcp',
    name: 'mcp',
    description: 'custom service account for MCP Server',
    groups: [],
  },
  {
    id: '72NjrP5P',
    username: 'sa',
    name: 'sa',
    description: 'new',
    groups: ['Admin'],
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

export default function TenantServiceAccountsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [serviceAccountName, setServiceAccountName] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('all-time');
  const [columns, setColumns] = useState<ColumnConfig[]>(TENANT_SERVICE_ACCOUNTS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(tenantServiceAccountsSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes('user') && serviceAccountName.trim()) {
      filters.push({
        id: 'user',
        label: 'Name',
        value: serviceAccountName.trim(),
        operator: 'matches',
      });
    }

    return filters;
  }, [visibleFilters, serviceAccountName]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const nameTerm = serviceAccountName.trim().toLowerCase();

    return TENANT_SERVICE_ACCOUNT_ROWS.filter((row) => {
      const compositeName = row.name ?? '';

      if (searchTerm) {
        const haystack = `${row.id} ${compositeName} ${row.description ?? ''} ${(row.groups ?? []).join(' ')}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (nameTerm && !compositeName.toLowerCase().includes(nameTerm)) {
        return false;
      }

      return true;
    });
  }, [searchValue, serviceAccountName]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === 'user') {
      setServiceAccountName('');
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'user') {
      setServiceAccountName('');
    }
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setServiceAccountName('');
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_SERVICE_ACCOUNTS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-svcacct-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      filterState: {
        searchValue,
        selectedStates: [],
        statesOperator: 'in',
        selectedInterval,
        intervalStartDate: undefined,
        intervalEndDate: undefined,
        selectedLabels: [],
        labelsOperator: 'has-any-of',
        labelsCustomValue: '',
        selectedNamespaces: [],
        namespaceOperator: 'in',
        namespaceCustomValue: '',
        selectedFlows: [],
        selectedScopes: [],
        selectedKinds: [],
        selectedHierarchy: 'all',
        selectedInitialExecution: '',
        triggerIdOperator: 'equals',
        triggerIdValue: '',
        actorValue: '',
        selectedActions: [],
        actionsOperator: 'in',
        selectedResources: [],
        resourcesOperator: 'in',
        detailsKey: '',
        detailsValue: '',
        visibleFilters,
        userValue: serviceAccountName,
      },
    };

    tenantServiceAccountsSavedFiltersStorage.save(filter);
    setSavedFilters(tenantServiceAccountsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue);
    setServiceAccountName(state.userValue ?? '');
    setSelectedInterval(state.selectedInterval ?? 'all-time');

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    setVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantServiceAccountsSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantServiceAccountsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantServiceAccountsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantServiceAccountsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing tenant service accounts data...');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Service Accounts</h1>
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
          showChart={showChart}
          onToggleShowChart={setShowChart}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={setPeriodicRefresh}
          onRefreshData={handleRefreshData}
          columns={columns}
          onColumnsChange={setColumns}
          selectedStates={[]}
          statesOperator="in"
          onSelectedStatesChange={() => {}}
          onStatesOperatorChange={() => {}}
          selectedInterval={selectedInterval}
          intervalStartDate={undefined}
          intervalEndDate={undefined}
          onIntervalChange={(interval) => setSelectedInterval(interval)}
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
          userValue={serviceAccountName}
          onUserChange={setServiceAccountName}
          selectedSuperadminStatuses={[]}
          superadminOperator="in"
          onSuperadminSelectionChange={() => {}}
          onSuperadminOperatorChange={() => {}}
          userFilterTitle="Name"
          userFilterPlaceholder="Search by service account name..."
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={TENANT_SERVICE_ACCOUNTS_FILTER_OPTIONS}
          searchPlaceholder="Search..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4 bg-[#1F232D]">
          <UsersTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
