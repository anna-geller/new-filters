import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface TenantRow {
  id: string;
  name: string;
  workerGroup?: string;
}

interface TenantsTableProps {
  rows: TenantRow[];
  columns: ColumnConfig[];
}

export default function TenantsTable({ rows, columns }: TenantsTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: TenantRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return <span className="text-foreground/90 font-mono text-sm">{row.id}</span>;
      case "name":
        return <span className="font-medium text-foreground">{row.name}</span>;
      case "workerGroup":
        return row.workerGroup ? (
          <span className="text-foreground/90">{row.workerGroup}</span>
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
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="bg-surface/60 text-muted-foreground">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70"
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
