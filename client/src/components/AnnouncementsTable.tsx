import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface AnnouncementRow {
  message: string;
  type: "INFO" | "WARNING" | "ERROR";
  startDate: string;
  endDate: string;
  active: boolean;
}

interface AnnouncementsTableProps {
  rows: AnnouncementRow[];
  columns: ColumnConfig[];
}

const typeStyles: Record<AnnouncementRow["type"], string> = {
  INFO: "bg-sky-900/40 text-sky-300 border-sky-700",
  WARNING: "bg-amber-900/40 text-amber-300 border-amber-700",
  ERROR: "bg-rose-900/40 text-rose-300 border-rose-700",
};

export default function AnnouncementsTable({ rows, columns }: AnnouncementsTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: AnnouncementRow, columnId: string) => {
    switch (columnId) {
      case "message":
        return <span className="text-foreground/90">{row.message}</span>;
      case "type":
        return (
          <Badge variant="outline" className={`text-xs border ${typeStyles[row.type]}`}>
            {row.type}
          </Badge>
        );
      case "startDate":
        return <span className="text-foreground/90">{row.startDate}</span>;
      case "endDate":
        return <span className="text-foreground/90">{row.endDate}</span>;
      case "active":
        return (
          <span className={row.active ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
            {row.active ? "✔" : "✕"}
          </span>
        );
      default:
        return <span className="text-muted-foreground">—</span>;
    }
  };

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-sm">
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
            {rows.map((row, index) => (
              <tr key={`${row.message}-${index}`} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
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
