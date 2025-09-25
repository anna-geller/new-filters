import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface SecretRow {
  namespace: string;
  key: string;
  description?: string;
  tags?: string[];
}

interface SecretsTableProps {
  rows: SecretRow[];
  columns: ColumnConfig[];
  onTagClick?: (tag: string) => void;
}

export default function SecretsTable({ rows, columns, onTagClick }: SecretsTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: SecretRow, columnId: string) => {
    switch (columnId) {
      case "namespace":
        return <span className="font-mono text-sm text-foreground/90">{row.namespace}</span>;
      case "key":
        return <span className="text-foreground font-medium">{row.key}</span>;
      case "description":
        return row.description ? (
          <span className="text-foreground/90">{row.description}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "tags":
        return row.tags && row.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="rounded-full bg-muted/40 border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:bg-muted/70"
              >
                {tag}
              </button>
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
              <tr key={`${row.namespace}-${row.key}`} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
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

