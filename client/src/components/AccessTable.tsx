import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface AccessRow {
  id: string;
  type: "Group" | "User";
  members: string;
  role: string;
  namespace: string;
}

interface AccessTableProps {
  rows: AccessRow[];
  columns: ColumnConfig[];
}

export default function AccessTable({ rows, columns }: AccessTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: AccessRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return <span className="font-mono text-sm text-foreground/90">{row.id}</span>;
      case "type":
        return <span className="text-foreground font-medium">{row.type}</span>;
      case "members":
        return <span className="text-foreground/90">{row.members}</span>;
      case "role":
        return <span className="text-foreground/90">{row.role}</span>;
      case "namespace":
        return row.namespace ? (
          <span className="font-mono text-xs md:text-sm text-foreground/90">{row.namespace}</span>
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
        <table className="w-full min-w-[48rem] text-sm">
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

