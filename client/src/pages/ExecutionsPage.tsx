import { useState } from 'react';
import FilterInterface from '@/components/FilterInterface';
import ExecutionsTable from '@/components/ExecutionsTable';
import TableControls from '@/components/TableControls';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
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
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { id: 'state', label: 'State', value: '6 selected' },
    { id: 'timerange', label: 'Time range', value: 'last 7 days' }
  ]);
  const [tableControlsExpanded, setTableControlsExpanded] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);

  const handleClearFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    console.log(`Cleared filter: ${filterId}`);
  };

  const handleEditFilter = (filterId: string) => {
    console.log(`Editing filter: ${filterId}`);
  };

  const handleRefreshData = () => {
    console.log('Refreshing execution data...');
  };

  const handleTableOptions = () => {
    console.log('Opening table options...');
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
          activeFilters={activeFilters}
          onClearFilter={handleClearFilter}
          onEditFilter={handleEditFilter}
        />

        {/* Applied Filters Summary (when filters are active) */}
        {activeFilters.length > 0 && (
          <div className="px-4 py-2 bg-card/30 border-b border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-foreground">Scope: User Executions</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">Subflow: All Executions</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">Time range: Last 7 days</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">Kind: Default</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">State: to SUCCESS, CREATED</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFilters([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
                <button className="text-primary hover:text-primary/80">
                  Save filter
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  Saved filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chart Toggle */}
        <div className="px-4 py-3 border-b border-border">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span className="text-foreground">Show Chart</span>
          </label>
        </div>

        {/* Table */}
        <div className="p-4">
          <ExecutionsTable executions={mockExecutions} />
        </div>

        {/* Table Controls */}
        <TableControls
          isExpanded={tableControlsExpanded}
          onToggleExpanded={() => setTableControlsExpanded(!tableControlsExpanded)}
          periodicRefresh={periodicRefresh}
          onTogglePeriodicRefresh={setPeriodicRefresh}
          onRefreshData={handleRefreshData}
          onTableOptions={handleTableOptions}
        />
      </main>
    </div>
  );
}