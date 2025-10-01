import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import UsersTable, { type UserRow } from '@/components/UsersTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { instanceUsersSavedFiltersStorage } from '@/utils/instanceUsersSavedFiltersStorage';

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_USERS_FILTER_OPTIONS: FilterOption[] = [
  { id: 'user', label: 'Username', description: 'Filter by username', enabled: false, order: 1 },
  { id: 'superadmin', label: 'Superadmin', description: 'Filter by superadmin status', enabled: false, order: 2 },
];

const INSTANCE_USERS_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'Id', description: 'Unique identifier for the user', visible: true, order: 1 },
  { id: 'username', label: 'Username', description: "User's login identifier", visible: true, order: 2 },
  { id: 'name', label: 'Name', description: 'Full name of the user', visible: true, order: 3 },
  { id: 'authentications', label: 'Authentications', description: 'Authentication methods', visible: true, order: 4 },
  { id: 'tenants', label: 'Tenants', description: 'Tenants the user belongs to', visible: true, order: 5 },
  { id: 'superadmin', label: 'Superadmin', description: 'Superadmin privilege flag', visible: true, order: 6 },
];

const INSTANCE_USER_ROWS: UserRow[] = [
  {
    id: '37J5NryW',
    username: 'user1@kestra.io',
    name: 'Adrian Smith',
    tenants: [],
    authentications: ['google'],
    superadmin: false,
  },
  {
    id: '7PGWTLQ8',
    username: 'use21@kestra.io',
    name: 'Alex EMERICH',
    tenants: ['main'],
    authentications: ['google'],
    superadmin: true,
  },
  {
    id: 'RjUNN0g6',
    username: 'user3@kestra.io',
    name: 'Anna GELLER (You)',
    tenants: ['main', 'DevRel', 'demo'],
    authentications: ['google'],
    superadmin: true,
  },
];

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

const SUPERADMIN_LABEL_MAP: Record<string, string> = {
  true: 'Superadmin',
  false: 'Non-Superadmin',
};

export default function InstanceUsersPage() {
  const [searchValue, setSearchValue] = useState('');
  const [userValue, setUserValue] = useState('');
  const [selectedSuperadminStatuses, setSelectedSuperadminStatuses] = useState<string[]>([]);
  const [superadminOperator, setSuperadminOperator] = useState<'in' | 'not-in'>('in');
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('all-time');
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_USERS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceUsersSavedFiltersStorage.getAll());
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

    if (visibleFilters.includes('superadmin') && selectedSuperadminStatuses.length > 0) {
      const valueLabel = selectedSuperadminStatuses
        .map((status) => SUPERADMIN_LABEL_MAP[status as 'true' | 'false'])
        .join(', ');
      filters.push({
        id: 'superadmin',
        label: 'Superadmin',
        value: valueLabel,
        operator: superadminOperator === 'not-in' ? 'not in' : 'in',
      });
    }

    return filters;
  }, [visibleFilters, userValue, selectedSuperadminStatuses, superadminOperator]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const usernameTerm = userValue.trim().toLowerCase();

    return INSTANCE_USER_ROWS.filter((row) => {
      if (searchTerm) {
        const haystack = `${row.username} ${row.name ?? ''} ${(row.tenants ?? []).join(' ')} ${(row.authentications ?? []).join(' ')}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (usernameTerm && !row.username.toLowerCase().includes(usernameTerm)) {
        return false;
      }

      if (selectedSuperadminStatuses.length > 0) {
        const isSuperadmin = row.superadmin === true ? 'true' : 'false';
        const matchesSelection = selectedSuperadminStatuses.includes(isSuperadmin);
        if (superadminOperator === 'in') {
          if (!matchesSelection) {
            return false;
          }
        } else if (matchesSelection) {
          return false;
        }
      }

      return true;
    });
  }, [searchValue, userValue, selectedSuperadminStatuses, superadminOperator]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === 'user') {
      setUserValue('');
    } else if (filterId === 'superadmin') {
      setSelectedSuperadminStatuses([]);
      setSuperadminOperator('in');
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'user') {
      setUserValue('');
    } else if (filterId === 'superadmin') {
      setSelectedSuperadminStatuses([]);
      setSuperadminOperator('in');
    }
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setUserValue('');
    setSelectedSuperadminStatuses([]);
    setSuperadminOperator('in');
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_USERS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-users-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        selectedSuperadminStatuses,
        superadminOperator,
      },
    };

    instanceUsersSavedFiltersStorage.save(filter);
    setSavedFilters(instanceUsersSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue);
    setUserValue(state.userValue ?? '');
    setSelectedSuperadminStatuses(state.selectedSuperadminStatuses ?? []);
    setSuperadminOperator((state.superadminOperator as 'in' | 'not-in') || 'in');
    setSelectedInterval(state.selectedInterval ?? 'all-time');

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    setVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceUsersSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceUsersSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceUsersSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceUsersSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing instance users data...');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Instance Administration</span>
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
          userValue={userValue}
          onUserChange={setUserValue}
          selectedSuperadminStatuses={selectedSuperadminStatuses}
          superadminOperator={superadminOperator}
          onSuperadminSelectionChange={setSelectedSuperadminStatuses}
          onSuperadminOperatorChange={setSuperadminOperator}
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
          filterOptions={INSTANCE_USERS_FILTER_OPTIONS}
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
