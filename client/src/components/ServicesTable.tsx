import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface ServiceRow {
  id: string;
  type: string;
  state: string;
  hostname: string;
  serverType: string;
  version: string;
  startDate: string;
  healthCheckDate: string;
}

interface ServicesTableProps {
  rows: ServiceRow[];
  columns: ColumnConfig[];
}

const formatState = (state: string) => state
  .toLowerCase()
  .split(" ")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

export default function ServicesTable({ rows, columns }: ServicesTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: ServiceRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return <span className="font-mono text-sm text-foreground/90">{row.id}</span>;
      case "type":
        return <span className="text-foreground font-medium uppercase tracking-wide">{row.type}</span>;
      case "state":
        return <span className="text-foreground/90">{formatState(row.state)}</span>;
      case "hostname":
        return <span className="font-mono text-xs md:text-sm text-foreground/90">{row.hostname}</span>;
      case "serverType":
        return <span className="text-foreground/90 uppercase tracking-wide">{row.serverType}</span>;
      case "version":
        return <span className="font-mono text-xs md:text-sm text-foreground/90">{row.version}</span>;
      case "startDate":
        return <span className="text-foreground/90">{row.startDate}</span>;
      case "healthCheckDate":
        return <span className="text-foreground/90">{row.healthCheckDate}</span>;
      default:
        return <span className="text-muted-foreground">—</span>;
    }
  };

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
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

