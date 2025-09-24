import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "./ExecutionsTable";

export interface LogRow {
  date: string;
  level: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";
  namespace: string;
  flow: string;
  taskId: string;
  scope: "user" | "system";
  executionId: string;
  message: string;
  triggerId: string;
}

interface LogsTableProps {
  logs: LogRow[];
  columns: ColumnConfig[];
}

const columnClasses: Record<string, string> = {
  date: "min-w-[8.5rem] max-w-[10rem]",
  level: "min-w-[4.5rem] max-w-[5.5rem]",
  namespace: "min-w-[8rem] max-w-[11rem]",
  flow: "min-w-[9rem] max-w-[12rem]",
  scope: "min-w-[6.5rem] max-w-[8rem]",
  task: "min-w-[8rem] max-w-[10rem]",
  executionId: "min-w-[11rem] max-w-[14rem]",
  message: "min-w-[14rem]",
};

const levelColors: Record<LogRow["level"], string> = {
  TRACE: "text-slate-300",
  DEBUG: "text-blue-300",
  INFO: "text-emerald-300",
  WARN: "text-amber-300",
  ERROR: "text-rose-400",
};

const scopeLabels: Record<LogRow["scope"], string> = {
  user: "User Logs",
  system: "System Logs",
};

export default function LogsTable({ logs, columns }: LogsTableProps) {
  const visibleColumns = columns
    .filter((column) => column.visible)
    .sort((a, b) => a.order - b.order);

  const renderCell = (row: LogRow, columnId: string) => {
    switch (columnId) {
      case "date":
        return (
          <span className="text-sm font-mono text-foreground" title={row.date}>
            {row.date}
          </span>
        );
      case "level":
        return (
          <span className={`text-sm font-semibold ${levelColors[row.level]}`} title={row.level}>
            {row.level}
          </span>
        );
      case "namespace":
        return (
          <span className="text-sm text-foreground truncate" title={row.namespace}>
            {row.namespace}
          </span>
        );
      case "flow":
        return (
          <span className="text-sm text-foreground truncate" title={row.flow}>
            {row.flow}
          </span>
        );
      case "task":
        return (
          <span className="text-sm text-foreground truncate" title={row.taskId}>
            {row.taskId}
          </span>
        );
      case "scope":
        return (
          <span className="text-sm text-foreground truncate" title={scopeLabels[row.scope]}>
            {scopeLabels[row.scope]}
          </span>
        );
      case "executionId":
        return (
          <span className="text-sm font-mono text-foreground truncate" title={row.executionId}>
            {row.executionId}
          </span>
        );
      case "message":
        return (
          <span className="text-sm text-muted-foreground whitespace-pre-wrap break-words" title={row.message}>
            {row.message}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-3 py-3 text-left font-medium text-muted-foreground align-top ${columnClasses[column.id] ?? "min-w-[10rem]"}`}
                >
                  <span className="truncate block" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((row, index) => (
              <tr key={`${row.executionId}-${index}`} className="border-b border-border last:border-b-0 hover:bg-card/40">
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-3 py-3 align-top text-foreground ${columnClasses[column.id] ?? "min-w-[10rem]"}`}
                  >
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
