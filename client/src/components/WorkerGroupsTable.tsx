import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface WorkerGroupRow {
  id: string;
  key: string;
  state: string;
  description: string;
}

interface WorkerGroupsTableProps {
  rows: WorkerGroupRow[];
  columns: ColumnConfig[];
}

export default function WorkerGroupsTable({ rows, columns }: WorkerGroupsTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: WorkerGroupRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return <span className="text-foreground/90 font-mono text-sm">{row.id}</span>;
      case "key":
        return <span className="font-medium text-foreground">{row.key}</span>;
      case "state":
        return <span className="text-foreground/90">{row.state}</span>;
      case "description":
        return row.description ? (
          <span className="text-foreground/90">{row.description}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      default:
        return <span className="text-muted-foreground">—</span>;
    }
  };

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead>
            <tr className="bg-surface/60 text-muted-foreground">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70 bg-[#2F3341]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
                {visibleColumns.map((column) => (
                  <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                    {renderCell(row, column.id)}
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
