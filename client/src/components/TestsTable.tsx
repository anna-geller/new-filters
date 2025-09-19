import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from "./ExecutionsTable";

export interface TestRow {
  id: string;
  namespace: string;
  flow: string;
  state: 'SUCCESS' | 'FAILED' | 'ERROR' | 'SKIPPED';
}

interface TestsTableProps {
  tests: TestRow[];
  columns: ColumnConfig[];
  onRunTest?: (testId: string) => void;
}

const columnClasses: Record<string, string> = {
  id: 'w-48 max-w-[12rem]',
  namespace: 'w-44 max-w-[11rem]',
  flow: 'w-56 max-w-[14rem]',
  state: 'w-28 max-w-[7rem]',
  run: 'w-24 max-w-[6rem]',
};

export default function TestsTable({ tests, columns, onRunTest }: TestsTableProps) {
  const visibleColumns = columns
    .filter((column) => column.visible)
    .sort((a, b) => a.order - b.order);

  const renderCell = (row: TestRow, columnId: string) => {
    switch (columnId) {
      case 'id':
        return (
          <span className="font-mono text-sm text-foreground truncate" title={row.id}>
            {row.id}
          </span>
        );
      case 'namespace':
        return (
          <span className="text-sm text-foreground truncate" title={row.namespace}>
            {row.namespace}
          </span>
        );
      case 'flow':
        return (
          <span className="text-sm text-foreground truncate" title={row.flow}>
            {row.flow}
          </span>
        );
      case 'state':
        return (
          <span className="text-sm font-semibold" title={row.state}>
            {row.state}
          </span>
        );
      case 'run':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRunTest?.(row.id)}
            data-testid={`button-run-test-${row.id}`}
          >
            Run
          </Button>
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
                  className={`px-4 py-3 text-left font-medium text-muted-foreground align-top ${columnClasses[column.id] ?? 'w-40'}`}
                >
                  <span className="truncate block" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-card/40">
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 align-top text-foreground ${columnClasses[column.id] ?? 'w-40'}`}
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
