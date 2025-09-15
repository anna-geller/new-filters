import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, ExternalLink } from "lucide-react";

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

export interface ColumnConfig {
  id: string;
  label: string;
  description: string;
  visible: boolean;
  order: number;
}

interface ExecutionsTableProps {
  executions: Execution[];
  columns?: ColumnConfig[];
}

export const defaultColumns: ColumnConfig[] = [
  { id: 'id', label: 'ID', description: 'Execution ID', visible: true, order: 1 },
  { id: 'start-date', label: 'Start date', description: 'When the execution started', visible: true, order: 2 },
  { id: 'end-date', label: 'End date', description: 'When the execution finished', visible: true, order: 3 },
  { id: 'duration', label: 'Duration', description: 'Total runtime of the execution', visible: true, order: 4 },
  { id: 'namespace', label: 'Namespace', description: 'Namespace to which the executed flow belongs', visible: true, order: 5 },
  { id: 'flow', label: 'Flow', description: 'ID of the executed flow', visible: true, order: 6 },
  { id: 'labels', label: 'Labels', description: 'Execution labels (key:value format)', visible: false, order: 7 },
  { id: 'state', label: 'State', description: 'Current execution state', visible: true, order: 8 },
];

const stateColors = {
  SUCCESS: 'bg-green-900/30 text-green-400 border-green-700',
  FAILED: 'bg-red-900/30 text-red-400 border-red-700',
  RUNNING: 'bg-blue-900/30 text-blue-400 border-blue-700',
  QUEUED: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
  WARNING: 'bg-orange-900/30 text-orange-400 border-orange-700',
  PAUSED: 'bg-gray-900/30 text-gray-400 border-gray-700',
  CREATED: 'bg-purple-900/30 text-purple-400 border-purple-700',
  RESTARTED: 'bg-teal-900/30 text-teal-400 border-teal-700',
  CANCELLED: 'bg-red-900/30 text-red-400 border-red-700'
};

export default function ExecutionsTable({ executions, columns }: ExecutionsTableProps) {
  const cols = Array.isArray(columns) ? columns : defaultColumns;
  const visibleColumns = cols
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  const getGridCols = (count: number) => {
    const colMap: { [key: number]: string } = {
      1: 'grid-cols-1',
      2: 'grid-cols-2', 
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10'
    };
    return colMap[count] || 'grid-cols-8';
  };

  const renderCellContent = (execution: Execution, columnId: string) => {
    switch (columnId) {
      case 'id':
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary">{execution.id}</span>
            <Button size="icon" variant="ghost" className="h-4 w-4">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'start-date':
        return <div className="text-foreground">{execution.startDate}</div>;
      case 'end-date':
        return <div className="text-foreground">{execution.endDate}</div>;
      case 'duration':
        return <div className="text-foreground">{execution.duration}</div>;
      case 'namespace':
        return <div className="text-foreground">{execution.namespace}</div>;
      case 'flow':
        return <div className="text-primary">{execution.flow}</div>;
      case 'labels':
        return (
          <div className="flex flex-wrap gap-1">
            {execution.labels.slice(0, 2).map((label, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
            {execution.labels.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{execution.labels.length - 2}
              </Badge>
            )}
          </div>
        );
      case 'state':
        return (
          <div className="flex items-center justify-between">
            <Badge className={`text-xs ${stateColors[execution.state]}`}>
              {execution.state}
            </Badge>
            <Button size="icon" variant="ghost" className="h-4 w-4">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Table Header */}
      <div className={`grid ${getGridCols(visibleColumns.length)} gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-border bg-card/50`}>
        {visibleColumns.map((column) => (
          <div key={column.id}>{column.label}</div>
        ))}
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {executions.map((execution) => (
          <div
            key={execution.id}
            className={`grid ${getGridCols(visibleColumns.length)} gap-4 p-4 text-sm hover-elevate`}
            data-testid={`row-execution-${execution.id}`}
          >
            {visibleColumns.map((column) => (
              <div key={column.id}>
                {renderCellContent(execution, column.id)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}