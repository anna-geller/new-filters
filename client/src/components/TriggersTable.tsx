import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "./ExecutionsTable";

export interface TriggerRow {
  id: string;
  flow: string;
  namespace: string;
  currentExecution?: string;
  lastTriggeredDate: string;
  contextUpdatedDate: string;
  nextEvaluationDate: string;
  details: string;
  backfillExecutions: string;
  actions: string;
  labels: string[];
  locked: "true" | "false";
  missingSource: "true" | "false";
}

interface TriggersTableProps {
  triggers: TriggerRow[];
  columns: ColumnConfig[];
}

const columnClasses: Record<string, string> = {
  id: "w-44 max-w-[11rem]",
  flow: "w-48 max-w-[12rem]",
  namespace: "w-52 max-w-[13rem]",
  currentExecution: "w-44 max-w-[11rem]",
  lastTriggeredDate: "w-48 max-w-[12rem]",
  contextUpdatedDate: "w-48 max-w-[12rem]",
  nextEvaluationDate: "w-48 max-w-[12rem]",
  details: "w-28 max-w-[7rem]",
  backfillExecutions: "w-40 max-w-[10rem]",
  actions: "w-32 max-w-[8rem]",
};

export default function TriggersTable({ triggers, columns }: TriggersTableProps) {
  const visibleColumns = columns
    .filter((column) => column.visible)
    .sort((a, b) => a.order - b.order);

  const renderCell = (row: TriggerRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return (
          <span className="font-mono text-sm text-foreground" title={row.id}>
            {row.id}
          </span>
        );
      case "flow":
        return <span className="text-sm text-foreground">{row.flow}</span>;
      case "namespace":
        return <span className="text-sm text-foreground">{row.namespace}</span>;
      case "currentExecution":
        return (
          <span className="text-sm text-muted-foreground">
            {row.currentExecution ?? "—"}
          </span>
        );
      case "lastTriggeredDate":
        return <span className="text-sm text-foreground">{row.lastTriggeredDate}</span>;
      case "contextUpdatedDate":
        return <span className="text-sm text-foreground">{row.contextUpdatedDate || "—"}</span>;
      case "nextEvaluationDate":
        return <span className="text-sm text-foreground">{row.nextEvaluationDate || "—"}</span>;
      case "details":
        return <span className="text-sm text-foreground">{row.details}</span>;
      case "backfillExecutions":
        return <span className="text-sm text-primary">{row.backfillExecutions}</span>;
      case "actions":
        return <span className="text-sm text-foreground">{row.actions}</span>;
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
                  className={`px-4 py-3 text-left font-medium text-muted-foreground align-top ${columnClasses[column.id] ?? "w-40"}`}
                >
                  <span className="truncate block" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {triggers.map((row) => (
              <tr key={row.id + row.namespace} className="border-b border-border last:border-b-0 hover:bg-card/40">
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 align-top text-foreground ${columnClasses[column.id] ?? "w-40"}`}
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
