import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, MoreVertical } from "lucide-react";
import type { ColumnConfig } from "@/types/savedFilters";

export type { ColumnConfig } from "@/types/savedFilters";

interface Execution {
  id: string;
  startDate: string;
  endDate: string;
  duration: string;
  namespace: string;
  flow: string;
  labels: string[];
  revision: string;
  inputs: string[];
  outputs: string[];
  taskId: string;
  state: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED' | 'WARNING' | 'PAUSED' | 'CREATED' | 'RESTARTED' | 'CANCELLED';
  concurrencySlot?: string;
}


interface ExecutionsTableProps {
  executions: Execution[];
  columns?: ColumnConfig[];
  onLabelClick?: (label: string) => void;
}

export const defaultColumns: ColumnConfig[] = [
  { id: 'id', label: 'ID', description: 'Execution ID', visible: true, order: 1 },
  { id: 'start-date', label: 'Start date', description: 'When the execution started', visible: true, order: 2 },
  { id: 'end-date', label: 'End date', description: 'When the execution finished', visible: true, order: 3 },
  { id: 'duration', label: 'Duration', description: 'Total runtime of the execution', visible: true, order: 4 },
  { id: 'concurrency-slot', label: 'Concurrency slot', description: 'Slot allocation for this execution', visible: false, order: 5 },
  { id: 'namespace', label: 'Namespace', description: 'Namespace to which the executed flow belongs', visible: true, order: 6 },
  { id: 'flow', label: 'Flow', description: 'ID of the executed flow', visible: true, order: 7 },
  { id: 'labels', label: 'Labels', description: 'Execution labels (key:value format)', visible: false, order: 8 },
  { id: 'state', label: 'State', description: 'Current execution state', visible: true, order: 9 },
  { id: 'revision', label: 'Revision', description: 'Version of the flow used for this execution', visible: false, order: 10 },
  { id: 'inputs', label: 'Inputs', description: 'Input values provided to the execution', visible: false, order: 11 },
  { id: 'outputs', label: 'Outputs', description: 'Outputs emitted by the execution', visible: false, order: 12 },
  { id: 'task-id', label: 'Task ID', description: 'ID of the last task in the execution', visible: false, order: 13 },
  { id: 'actions', label: 'Actions', description: 'Actions available for the execution', visible: false, order: 14 },
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

const columnClasses: Record<string, string> = {
  id: 'w-40 max-w-[10rem]',
  'start-date': 'w-44 max-w-[11rem]',
  'end-date': 'w-44 max-w-[11rem]',
  duration: 'w-24 max-w-[6rem]',
  namespace: 'w-48 max-w-[12rem]',
  flow: 'w-40 max-w-[10rem]',
  labels: 'w-56',
  state: 'w-28 max-w-[7rem]',
  revision: 'w-24 max-w-[6rem]',
  inputs: 'w-56',
  outputs: 'w-56',
  'task-id': 'w-32 max-w-[8rem]',
  'concurrency-slot': 'w-36 max-w-[9rem]',
  actions: 'w-16 max-w-[4rem]',
};

export default function ExecutionsTable({ executions, columns, onLabelClick }: ExecutionsTableProps) {
  const cols = Array.isArray(columns) ? columns : defaultColumns;
  const visibleColumns = useMemo(
    () =>
      cols
        .filter((col) => col.visible)
        .sort((a, b) => a.order - b.order),
    [cols],
  );

  const renderCellContent = (execution: Execution, columnId: string) => {
    switch (columnId) {
      case 'id':
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono truncate text-[#A3A4DF]" title={execution.id}>
              {execution.id}
            </span>
            <Button size="icon" variant="ghost" className="h-4 w-4">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'start-date':
        return (
          <span className="truncate" title={execution.startDate}>
            {execution.startDate}
          </span>
        );
      case 'end-date':
        return (
          <span className="truncate" title={execution.endDate}>
            {execution.endDate}
          </span>
        );
      case 'duration':
        return (
          <span className="whitespace-nowrap" title={execution.duration}>
            {execution.duration}
          </span>
        );
      case 'concurrency-slot': {
        const slotLabel = (execution.concurrencySlot ?? 'default').replace(/[-_]/g, ' ');
        return (
          <Badge
            variant="outline"
            className="text-xs border-border/40 text-foreground/80 uppercase tracking-wide"
            title={slotLabel}
          >
            {slotLabel}
          </Badge>
        );
      }
      case 'namespace':
        return (
          <span className="truncate" title={execution.namespace}>
            {execution.namespace}
          </span>
        );
      case 'flow':
        return (
          <span className="truncate" title={execution.flow}>
            {execution.flow}
          </span>
        );
      case 'labels':
        return (
          <div className="flex flex-wrap gap-1 max-w-[12rem]">
            {execution.labels.map((label, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs cursor-pointer transition-all duration-200 
                  ${
                    onLabelClick
                      ? 'hover:bg-blue-500/20 hover:border-blue-400 hover:text-blue-300 border-border/40 text-foreground/80'
                      : 'border-border text-foreground/80'
                  }
                  hover:scale-105 active:scale-95 whitespace-nowrap`}
                onClick={() => onLabelClick?.(label)}
                data-testid={`label-badge-${label}`}
              >
                {label}
              </Badge>
            ))}
          </div>
        );
      case 'revision':
        return (
          <span className="font-mono text-sm text-muted-foreground" title={execution.revision}>
            {execution.revision}
          </span>
        );
      case 'inputs':
        return (
          <div className="flex flex-wrap gap-1">
            {execution.inputs.slice(0, 2).map((input, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-border/40 text-foreground/80 max-w-[11rem] truncate"
              >
                {input}
              </Badge>
            ))}
            {execution.inputs.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs border-border/40 text-muted-foreground pointer-events-none"
              >
                +{execution.inputs.length - 2}
              </Badge>
            )}
          </div>
        );
      case 'outputs':
        return (
          <div className="flex flex-wrap gap-1">
            {execution.outputs.slice(0, 2).map((output, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-border/40 text-foreground/80 max-w-[11rem] truncate"
              >
                {output}
              </Badge>
            ))}
            {execution.outputs.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs border-border/40 text-muted-foreground pointer-events-none"
              >
                +{execution.outputs.length - 2}
              </Badge>
            )}
          </div>
        );
      case 'task-id':
        return (
          <span className="font-mono text-sm text-foreground truncate" title={execution.taskId}>
            {execution.taskId}
          </span>
        );
      case 'state':
        return (
          <Badge className={`text-xs ${stateColors[execution.state]}`}>
            {execution.state}
          </Badge>
        );
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadcn-card rounded-xl border border-card-border text-card-foreground shadow-sm overflow-hidden bg-[#262A35]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground align-top w-40 max-w-[10rem] bg-[#2F3341]"
                >
                  <span className="truncate block" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {executions.map((execution) => (
              <tr key={execution.id} className="border-b border-border last:border-b-0 hover:bg-card/40">
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 align-top text-foreground ${columnClasses[column.id] ?? 'w-40'} `}
                  >
                    <div className="min-h-[32px] flex items-start">
                      {renderCellContent(execution, column.id)}
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
