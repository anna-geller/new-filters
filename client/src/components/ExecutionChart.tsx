import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface Execution {
  id: string;
  startDate: string;
  endDate: string;
  duration: string;
  namespace: string;
  flow: string;
  labels: string[];
  state: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED' | 'WARNING' | 'PAUSED' | 'CREATED' | 'RESTARTED' | 'CANCELLED';
}

interface ExecutionChartProps {
  executions: Execution[];
}

const stateColors = {
  SUCCESS: '#22c55e',
  FAILED: '#ef4444', 
  RUNNING: '#3b82f6',
  QUEUED: '#eab308',
  WARNING: '#f97316',
  PAUSED: '#6b7280',
  CREATED: '#8b5cf6',
  RESTARTED: '#14b8a6',
  CANCELLED: '#ef4444'
};

const chartConfig = {
  SUCCESS: { label: 'Success', color: stateColors.SUCCESS },
  FAILED: { label: 'Failed', color: stateColors.FAILED },
  RUNNING: { label: 'Running', color: stateColors.RUNNING },
  QUEUED: { label: 'Queued', color: stateColors.QUEUED },
  WARNING: { label: 'Warning', color: stateColors.WARNING },
  PAUSED: { label: 'Paused', color: stateColors.PAUSED },
  CREATED: { label: 'Created', color: stateColors.CREATED },
  RESTARTED: { label: 'Restarted', color: stateColors.RESTARTED },
  CANCELLED: { label: 'Cancelled', color: stateColors.CANCELLED },
};

export default function ExecutionChart({ executions }: ExecutionChartProps) {
  // Calculate state counts
  const stateCounts = executions.reduce((acc, execution) => {
    acc[execution.state] = (acc[execution.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transform data for chart
  const chartData = Object.entries(stateColors).map(([state, color]) => ({
    state,
    count: stateCounts[state] || 0,
    fill: color
  })).filter(item => item.count > 0); // Only show states that have executions

  const totalExecutions = executions.length;

  return (
    <Card className="shadcn-card rounded-xl text-card-foreground shadow-sm mx-4 mb-4 p-6 border border-border bg-[#262A35]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Execution Overview</h3>
            <p className="text-sm text-muted-foreground">Distribution of {totalExecutions} execution states</p>
          </div>
        </div>
        
        <ChartContainer config={chartConfig} className="h-64" data-testid="execution-chart-container">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis 
              dataKey="state" 
              className="text-xs"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name, payload) => [
                  value, 
                  `${payload.payload?.state || 'Unknown'} executions`
                ]}
              />}
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              className="transition-all duration-200 hover:opacity-80"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}