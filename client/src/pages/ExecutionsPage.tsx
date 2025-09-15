import { useState } from 'react';
import FilterInterface from '@/components/FilterInterface';
import ExecutionsTable, { ColumnConfig, defaultColumns } from '@/components/ExecutionsTable';

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
    state: 'CANCELLED' as const
  }
];

export default function ExecutionsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedStates, setSelectedStates] = useState(['SUCCESS', 'RUNNING', 'CREATED']);
  const [selectedTimeRange, setSelectedTimeRange] = useState('last-7-days');
  const [timeRangeStartDate, setTimeRangeStartDate] = useState<string>();
  const [timeRangeEndDate, setTimeRangeEndDate] = useState<string>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState('in');
  const [labelsCustomValue, setLabelsCustomValue] = useState('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  
  // Helper function to get display value for time range
  const getTimeRangeDisplayValue = () => {
    if (selectedTimeRange === 'custom-range' && timeRangeStartDate && timeRangeEndDate) {
      return `${new Date(timeRangeStartDate).toLocaleDateString()} - ${new Date(timeRangeEndDate).toLocaleDateString()}`;
    }
    // Convert kebab-case to readable format
    return selectedTimeRange.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Derive active filters from state
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  
  // Build active filters array
  const dynamicFilters = [];
  
  // Time range is now a direct control, not a filter badge
  
  // Add state filter if states are selected
  if (selectedStates.length > 0) {
    const stateFilter = {
      id: 'state',
      label: 'State',
      value: `${selectedStates.length} selected`,
      operator: 'in'
    };
    dynamicFilters.push(stateFilter);
  }

  // Add labels filter if labels are selected or custom value is set
  const isTextBasedLabelsOperator = ['starts-with', 'ends-with', 'contains', 'does-not-contain', 'exactly-matches'].includes(labelsOperator);
  if ((isTextBasedLabelsOperator && labelsCustomValue.trim()) || (!isTextBasedLabelsOperator && selectedLabels.length > 0)) {
    const labelsFilter = {
      id: 'labels',
      label: 'Labels',
      value: isTextBasedLabelsOperator ? labelsCustomValue : `${selectedLabels.length} selected`,
      operator: labelsOperator
    };
    dynamicFilters.push(labelsFilter);
  }

  // Add namespace filter if namespaces are selected
  if (selectedNamespaces.length > 0) {
    const namespaceFilter = {
      id: 'namespace',
      label: 'Namespace',
      value: `${selectedNamespaces.length} selected`,
      operator: 'in'
    };
    dynamicFilters.push(namespaceFilter);
  }
  
  const allActiveFilters = [...dynamicFilters, ...activeFilters];

  const handleClearFilter = (filterId: string) => {
    if (filterId === 'state') {
      setSelectedStates([]);
    } else if (filterId === 'labels') {
      setSelectedLabels([]);
      setLabelsCustomValue('');
    } else if (filterId === 'namespace') {
      setSelectedNamespaces([]);
    } else {
      setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    }
    console.log(`Cleared filter: ${filterId}`);
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

  const handleTimeRangeChange = (timeRange: string, startDate?: string, endDate?: string) => {
    setSelectedTimeRange(timeRange);
    setTimeRangeStartDate(startDate);
    setTimeRangeEndDate(endDate);
  };

  const handleResetFilters = () => {
    // Reset search to empty
    setSearchValue('');
    // Reset time range to default (7 days)
    setSelectedTimeRange('last-7-days');
    setTimeRangeStartDate(undefined);
    setTimeRangeEndDate(undefined);
    // Clear selected states
    setSelectedStates([]);
    // Clear labels
    setSelectedLabels([]);
    setLabelsOperator('in');
    setLabelsCustomValue('');
    // Clear namespaces
    setSelectedNamespaces([]);
    // Clear other active filters
    setActiveFilters([]);
    console.log('All filters reset to default values');
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
          onSelectedStatesChange={setSelectedStates}
          selectedTimeRange={selectedTimeRange}
          timeRangeStartDate={timeRangeStartDate}
          timeRangeEndDate={timeRangeEndDate}
          onTimeRangeChange={handleTimeRangeChange}
          selectedLabels={selectedLabels}
          labelsOperator={labelsOperator}
          labelsCustomValue={labelsCustomValue}
          onLabelsSelectionChange={setSelectedLabels}
          onLabelsOperatorChange={setLabelsOperator}
          onLabelsCustomValueChange={setLabelsCustomValue}
          selectedNamespaces={selectedNamespaces}
          onNamespacesSelectionChange={setSelectedNamespaces}
        />


        {/* Table */}
        <div className="p-4">
          <ExecutionsTable executions={mockExecutions} columns={columns} />
        </div>

      </main>
    </div>
  );
}