import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";
import type { ColumnConfig } from "./ExecutionsTable";

export interface TriggerRow {
  id: string;
  flow: string;
  namespace: string;
  lastTriggeredDate: string;
  contextUpdatedDate: string;
  nextEvaluationDate: string;
  details: string;
  enabled: boolean;
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
  lastTriggeredDate: "w-48 max-w-[12rem]",
  contextUpdatedDate: "w-48 max-w-[12rem]",
  nextEvaluationDate: "w-48 max-w-[12rem]",
  details: "w-28 max-w-[7rem]",
  backfillExecutions: "w-16 max-w-[4rem]",
  enabled: "w-20 max-w-[5rem]",
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
      case "lastTriggeredDate":
        return <span className="text-sm text-foreground">{row.lastTriggeredDate}</span>;
      case "contextUpdatedDate":
        return <span className="text-sm text-foreground">{row.contextUpdatedDate || "—"}</span>;
      case "nextEvaluationDate":
        return <span className="text-sm text-foreground">{row.nextEvaluationDate || "—"}</span>;
      case "details":
        return <span className="text-sm text-foreground">{row.details}</span>;
      case "backfillExecutions":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-sm">
                  <RotateCcw className="h-4 w-4 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Backfill executions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "enabled":
        return (
          <Switch
            checked={row.enabled}
            onCheckedChange={(checked) => {
              // Handle toggle change - you can add your logic here
              console.log(`Toggle ${row.id} to ${checked}`);
            }}
          />
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
                    className="px-4 py-3 align-top text-foreground w-52 max-w-[13rem] bg-[#262A35]"
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
