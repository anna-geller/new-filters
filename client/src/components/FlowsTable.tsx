import { Card } from "@/components/ui/card";
import { ColumnConfig } from "./ExecutionsTable";
import { Badge } from "@/components/ui/badge";

export interface FlowRow {
  id: string;
  labels: string[];
  namespace: string;
  lastExecutionDate: string;
  lastExecutionStatus: 'SUCCESS' | 'FAILED';
  executionStatistics: Array<{ state: string; count: number; color: string }>;
  triggers: string[];
  revision: string;
  description: string;
}

interface FlowsTableProps {
  rows: FlowRow[];
  columns: ColumnConfig[];
}

const stateColors: Record<string, string> = {
  SUCCESS: '#22c55e',
  FAILED: '#ef4444',
};

export default function FlowsTable({ rows, columns }: FlowsTableProps) {
  const visibleColumns = columns
    .filter((column) => column.visible)
    .sort((a, b) => a.order - b.order);

  const renderCell = (row: FlowRow, columnId: string) => {
    switch (columnId) {
      case 'id':
        return (
          <span className="font-mono text-sm text-foreground truncate" title={row.id}>
            {row.id}
          </span>
        );
      case 'labels':
        return (
          <div className="flex flex-wrap gap-1">
            {row.labels.map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        );
      case 'namespace':
        return (
          <span className="text-sm text-foreground truncate" title={row.namespace}>
            {row.namespace}
          </span>
        );
      case 'last-execution-date':
        return (
          <span className="text-sm text-foreground truncate" title={row.lastExecutionDate}>
            {row.lastExecutionDate}
          </span>
        );
      case 'last-execution-status':
        return (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: `${stateColors[row.lastExecutionStatus]}20`,
              color: stateColors[row.lastExecutionStatus],
              borderColor: `${stateColors[row.lastExecutionStatus]}80`,
            }}
          >
            {row.lastExecutionStatus}
          </Badge>
        );
      case 'execution-statistics':
        return (
          <div className="flex items-center gap-1">
            {row.executionStatistics.map((item) => (
              <div
                key={item.state}
                className="h-2 rounded-sm"
                style={{
                  backgroundColor: stateColors[item.state] ?? '#71717a',
                  width: `${Math.max(item.count, 1) * 12}px`,
                }}
                title={`${item.state}: ${item.count}`}
              />
            ))}
          </div>
        );
      case 'triggers':
        return row.triggers.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.triggers.map((trigger) => (
              <Badge key={trigger} variant="secondary" className="text-xs">
                {trigger}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        );
      case 'revision':
        return (
          <span className="font-mono text-sm text-muted-foreground" title={row.revision}>
            {row.revision}
          </span>
        );
      case 'description':
        return (
          <span className="text-sm text-muted-foreground truncate" title={row.description}>
            {row.description || '—'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground align-top"
                  style={{ minWidth: '8rem' }}
                >
                  <span className="truncate block" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-card/40">
                {visibleColumns.map((column) => (
                  <td key={column.id} className="px-4 py-3 align-top text-foreground">
                    <div className="min-h-[32px] flex items-start">
                      {renderCell(row, column.id)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
