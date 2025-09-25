import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import UsersTable, { type UserRow } from '@/components/UsersTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { tenantUsersSavedFiltersStorage } from '@/utils/tenantUsersSavedFiltersStorage';

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const TENANT_USERS_FILTER_OPTIONS: FilterOption[] = [
  { id: 'user', label: 'Username', description: 'Filter by username', enabled: false, order: 1 },
];

const TENANT_USERS_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'Id', description: 'Unique identifier for the user', visible: true, order: 1 },
  { id: 'username', label: 'Username', description: "User's login identifier", visible: true, order: 2 },
  { id: 'name', label: 'Name', description: 'Full name of the user', visible: true, order: 3 },
  { id: 'authentications', label: 'Authentications', description: 'Authentication methods', visible: true, order: 4 },
  { id: 'groups', label: 'Groups', description: 'IAM groups the user belongs to', visible: true, order: 5 },
];

const TENANT_USER_ROWS: UserRow[] = [
  {
    id: '7PGWTLQ8',
    username: 'user1@kestra.io',
    name: 'Alex EMERICH',
    groups: ['Teams'],
    authentications: ['google'],
  },
  {
    id: 'RjUNN0g6',
    username: 'ageller@kestra.io',
    name: 'Anna GELLER',
    groups: ['Teams'],
    authentications: ['google'],
  },
  {
    id: '4SkxA1dW',
    username: 'user2@kestra.io',
    groups: ['Teams'],
    authentications: [],
  },
  {
    id: '4LuNupn',
    username: 'user3@kestra.io',
    groups: ['Teams'],
    authentications: [],
  },
  {
    id: '58K0BCPw',
    username: 'user4@kestra.io',
    name: 'Brian MULIER',
    groups: ['Teams'],
    authentications: ['google'],
  },
  {
    id: '37gN0yzd',
    username: 'user5@kestra.io',
    name: 'Benoit PIMPAUD',
    groups: ['Teams', 'Data'],
    authentications: ['google'],
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

export default function TenantUsersPage() {
  const [searchValue, setSearchValue] = useState('');
  const [userValue, setUserValue] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('all-time');
  const [columns, setColumns] = useState<ColumnConfig[]>(TENANT_USERS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(tenantUsersSavedFiltersStorage.getAll());
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (visibleFilters.includes('user') && userValue.trim()) {
      filters.push({
        id: 'user',
        label: 'Username',
        value: userValue.trim(),
        operator: 'matches',
      });
    }

    return filters;
  }, [visibleFilters, userValue]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const usernameTerm = userValue.trim().toLowerCase();

    return TENANT_USER_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.username} ${row.name ?? ''} ${(row.groups ?? []).join(' ')} ${(row.authentications ?? []).join(' ')}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (usernameTerm && !row.username.toLowerCase().includes(usernameTerm)) {
        return false;
      }

      return true;
    });
  }, [searchValue, userValue]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === 'user') {
      setUserValue('');
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'user') {
      setUserValue('');
    }
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setUserValue('');
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(TENANT_USERS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `tenant-users-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        userValue,
      },
    };

    tenantUsersSavedFiltersStorage.save(filter);
    setSavedFilters(tenantUsersSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue);
    setUserValue(state.userValue ?? '');
    setSelectedInterval(state.selectedInterval ?? 'all-time');

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    setVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteFilter = (filterId: string) => {
    tenantUsersSavedFiltersStorage.delete(filterId);
    setSavedFilters(tenantUsersSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    tenantUsersSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(tenantUsersSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing tenant users data...');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Tenant Administration</span>
            <h1 className="text-xl font-semibold text-foreground">Users</h1>
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
          userValue={userValue}
          onUserChange={setUserValue}
          selectedSuperadminStatuses={[]}
          superadminOperator="in"
          onSuperadminSelectionChange={() => {}}
          onSuperadminOperatorChange={() => {}}
          userFilterTitle="Username"
          userFilterPlaceholder="Search by username..."
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={TENANT_USERS_FILTER_OPTIONS}
          searchPlaceholder="Search users..."
          showChartToggleControl={false}
        />
        <div className="flex-1 overflow-auto p-4">
          <UsersTable rows={filteredRows} columns={columns} />
        </div>
      </main>
    </div>
  );
}
