import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface VersionedPluginRow {
  plugin: string;
  versions: string[];
}

interface VersionedPluginsTableProps {
  rows: VersionedPluginRow[];
  columns: ColumnConfig[];
}

export default function VersionedPluginsTable({ rows, columns }: VersionedPluginsTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: VersionedPluginRow, columnId: string) => {
    switch (columnId) {
      case "plugin":
        return <span className="font-medium text-foreground">{row.plugin}</span>;
      case "versions":
        return row.versions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.versions.map((version) => (
              <Badge key={version} variant="secondary" className="text-xs">
                {version}
              </Badge>
            ))}
          </div>
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
                  className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70 bg-[#2F3341]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.plugin} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
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
