import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface ProvisioningRow {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
}

interface ProvisioningTableProps {
  rows: ProvisioningRow[];
  columns: ColumnConfig[];
}

const stateStyles = {
  enabled: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  disabled: "bg-rose-900/40 text-rose-300 border-rose-700",
};

export default function ProvisioningTable({ rows, columns }: ProvisioningTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: ProvisioningRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return <span className="text-foreground/90 font-mono text-sm">{row.id}</span>;
      case "name":
        return <span className="font-medium text-foreground">{row.name}</span>;
      case "type":
        return <span className="text-foreground/90">{row.type}</span>;
      case "description":
        return row.description ? (
          <span className="text-foreground/90">{row.description}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "state": {
        const styleKey = row.enabled ? "enabled" : "disabled";
        const label = row.enabled ? "Enabled" : "Disabled";
        return (
          <Badge variant="outline" className={`text-xs border ${stateStyles[styleKey]}`}>
            {label}
          </Badge>
        );
      }
      default:
        return <span className="text-muted-foreground">—</span>;
    }
  };

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm">
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
                  <td key={column.id} className="py-3 px-4 align-top">
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
