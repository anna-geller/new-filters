import { useEffect, useMemo, useState } from 'react';
import FilterInterface, { type FilterOption } from '@/components/FilterInterface';
import UsersTable, { type UserRow } from '@/components/UsersTable';
import type { ColumnConfig } from '@/components/ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';
import { instanceServiceAccountsSavedFiltersStorage } from '@/utils/instanceServiceAccountsSavedFiltersStorage';

const DEFAULT_VISIBLE_FILTERS: string[] = [];

const INSTANCE_SERVICE_ACCOUNTS_FILTER_OPTIONS: FilterOption[] = [
  { id: 'user', label: 'Name', description: 'Filter by service account name', enabled: false, order: 1 },
  { id: 'superadmin', label: 'Superadmin', description: 'Filter by superadmin status', enabled: false, order: 2 },
];

const INSTANCE_SERVICE_ACCOUNTS_COLUMNS: ColumnConfig[] = [
  { id: 'id', label: 'Id', description: 'Unique identifier for the service account', visible: true, order: 1 },
  { id: 'name', label: 'Name', description: 'Display name of the service account', visible: true, order: 2 },
  { id: 'description', label: 'Description', description: 'Service account description', visible: true, order: 3 },
  { id: 'tenants', label: 'Tenants', description: 'Tenants the service account belongs to', visible: true, order: 4 },
  { id: 'superadmin', label: 'Superadmin', description: 'Superadmin privilege flag', visible: true, order: 5 },
];

const INSTANCE_SERVICE_ACCOUNT_ROWS: UserRow[] = [
  {
    id: '2wcyybkt',
    username: 'custom-service-account',
    name: 'custom-service-account',
    description: 'My Custom Service Account',
    tenants: ['demo'],
    superadmin: false,
  },
  {
    id: '5q28ntB2',
    username: 'mcp',
    name: 'mcp',
    description: 'Service Account for MCP Server',
    tenants: [],
    superadmin: true,
  },
  {
    id: '14g3f14c',
    username: 'default-service-account',
    name: '',
    description: 'Default service account created for SCIM Provisioning',
    tenants: ['demo'],
    superadmin: false,
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

export default function InstanceServiceAccountsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [serviceAccountName, setServiceAccountName] = useState('');
  const [selectedSuperadminStatus, setSelectedSuperadminStatus] = useState('all');
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('all-time');
  const [columns, setColumns] = useState<ColumnConfig[]>(INSTANCE_SERVICE_ACCOUNTS_COLUMNS.map((column) => ({ ...column })));
  const [visibleFilters, setVisibleFilters] = useState<string[]>(DEFAULT_VISIBLE_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setSavedFilters(instanceServiceAccountsSavedFiltersStorage.getAll());
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

    if (visibleFilters.includes('superadmin') && selectedSuperadminStatus !== 'all') {
      const valueLabel = selectedSuperadminStatus === 'true' ? 'Superadmin' : 'Non-Superadmin';
      filters.push({
        id: 'superadmin',
        label: 'Superadmin',
        value: valueLabel,
      });
    }

    return filters;
  }, [visibleFilters, serviceAccountName, selectedSuperadminStatus]);

  const filteredRows = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();
    const nameTerm = serviceAccountName.trim().toLowerCase();

    return INSTANCE_SERVICE_ACCOUNT_ROWS.filter((row) => {
      const compositeName = row.name ?? row.username ?? '';

      if (searchTerm) {
        const haystack = `${row.id} ${compositeName} ${row.description ?? ''} ${(row.tenants ?? []).join(' ')}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }

      if (nameTerm && !compositeName.toLowerCase().includes(nameTerm)) {
        return false;
      }

      if (selectedSuperadminStatus !== 'all') {
        const isSuperadmin = row.superadmin === true ? 'true' : 'false';
        if (selectedSuperadminStatus !== isSuperadmin) {
          return false;
        }
      }

      return true;
    });
  }, [searchValue, serviceAccountName, selectedSuperadminStatus]);

  const handleClearFilter = (filterId: string) => {
    if (filterId === 'user') {
      setServiceAccountName('');
    } else if (filterId === 'superadmin') {
      setSelectedSuperadminStatuses([]);
      setSuperadminOperator('in');
    }
    setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const handleResetFilter = (filterId: string) => {
    if (filterId === 'user') {
      setServiceAccountName('');
    } else if (filterId === 'superadmin') {
      setSelectedSuperadminStatus('all');
    }
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setServiceAccountName('');
    setSelectedSuperadminStatus('all');
    setShowChart(false);
    setPeriodicRefresh(true);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setColumns(INSTANCE_SERVICE_ACCOUNTS_COLUMNS.map((column) => ({ ...column })));
  };

  const handleSaveFilter = (name: string, description: string) => {
    const now = new Date().toISOString();
    const filter: SavedFilter = {
      id: `instance-svcacct-filter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
        selectedSuperadminStatus,
      },
    };

    instanceServiceAccountsSavedFiltersStorage.save(filter);
    setSavedFilters(instanceServiceAccountsSavedFiltersStorage.getAll());
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    const state = filter.filterState;
    setSearchValue(state.searchValue);
    setServiceAccountName(state.userValue ?? '');
    setSelectedSuperadminStatuses(state.selectedSuperadminStatuses ?? []);
    setSuperadminOperator((state.superadminOperator as 'in' | 'not-in') || 'in');
    setSelectedInterval(state.selectedInterval ?? 'all-time');

    const restoredVisibleFilters = state.visibleFilters && state.visibleFilters.length > 0
      ? Array.from(new Set(state.visibleFilters))
      : DEFAULT_VISIBLE_FILTERS;

    setVisibleFilters(restoredVisibleFilters);
  };

  const handleDeleteFilter = (filterId: string) => {
    instanceServiceAccountsSavedFiltersStorage.delete(filterId);
    setSavedFilters(instanceServiceAccountsSavedFiltersStorage.getAll());
  };

  const handleUpdateFilter = (filterId: string, name: string, description: string) => {
    instanceServiceAccountsSavedFiltersStorage.update(filterId, { name, description });
    setSavedFilters(instanceServiceAccountsSavedFiltersStorage.getAll());
  };

  const handleRefreshData = () => {
    console.log('Refreshing instance service accounts data...');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-[#262A35]/80">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F3341]">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Instance Administration</span>
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
          selectedSuperadminStatus={selectedSuperadminStatus}
          onSuperadminSelectionChange={setSelectedSuperadminStatus}
          userFilterTitle="Name"
          userFilterPlaceholder="Search..."
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
          onUpdateFilter={handleUpdateFilter}
          visibleFilters={visibleFilters}
          onVisibleFiltersChange={setVisibleFilters}
          onResetFilter={handleResetFilter}
          filterOptions={INSTANCE_SERVICE_ACCOUNTS_FILTER_OPTIONS}
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
