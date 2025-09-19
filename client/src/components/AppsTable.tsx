import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "./ExecutionsTable";

export interface AppRow {
  name: string;
  type: string;
  tags: string[];
  namespace: string;
  flow: string;
}

interface AppsTableProps {
  rows: AppRow[];
  columns: ColumnConfig[];
}

export default function AppsTable({ rows, columns }: AppsTableProps) {
  const visibleColumns = columns
    .filter((column) => column.visible)
    .sort((a, b) => a.order - b.order);

  const renderCell = (row: AppRow, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <span className="text-sm font-medium text-foreground truncate" title={row.name}>
            {row.name}
          </span>
        );
      case 'type':
        return (
          <Badge variant="secondary" className="text-xs uppercase tracking-wide" title={row.type}>
            {row.type}
          </Badge>
        );
      case 'tags':
        return row.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        );
      case 'namespace':
        return (
          <span className="text-sm text-foreground truncate" title={row.namespace}>
            {row.namespace}
          </span>
        );
      case 'flow':
        return (
          <span className="font-mono text-sm text-muted-foreground truncate" title={row.flow}>
            {row.flow}
          </span>
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
                  className="px-4 py-3 text-left font-medium text-muted-foreground align-top"
                  style={{ minWidth: '8rem' }}
                >
                  <span className="truncate block" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-border last:border-b-0 hover:bg-card/40">
                {visibleColumns.map((column) => (
                  <td key={column.id} className="px-4 py-3 align-top text-foreground">
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
