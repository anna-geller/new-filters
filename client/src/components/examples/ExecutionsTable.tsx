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
    revision: '1',
    inputs: ['customer_id:98213', 'region:us-east-1'],
    outputs: ['status:success', 'records_processed:4201'],
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
    revision: 'v2025.07.24+04',
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
    revision: '4',
    inputs: ['source:cli', 'plan:enterprise'],
    outputs: ['status:warning', 'alerts_sent:true'],
    taskId: 'notify-observers',
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
