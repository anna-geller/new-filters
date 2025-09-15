import ExecutionsTable from '../ExecutionsTable';

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
  }
];

export default function ExecutionsTableExample() {
  return (
    <div className="p-4">
      <ExecutionsTable executions={mockExecutions} />
    </div>
  );
}