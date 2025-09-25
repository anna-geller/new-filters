import { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import type { ColumnConfig } from './ExecutionsTable';
import { Badge } from "@/components/ui/badge";

export interface UserRow {
  id: string;
  username: string;
  name?: string;
  description?: string;
  groups?: string[];
  tenants?: string[];
  authentications?: string[];
  superadmin?: boolean;
}

interface UsersTableProps {
  rows: UserRow[];
  columns: ColumnConfig[];
}

export default function UsersTable({ rows, columns }: UsersTableProps) {
  const visibleColumns = useMemo(
    () =>
      columns
        .filter(column => column.visible)
        .sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: UserRow, columnId: string) => {
    switch (columnId) {
      case 'id':
        return <span className="text-foreground/90 font-mono text-sm">{row.id}</span>;
      case 'username':
        return <span className="font-medium text-foreground">{row.username}</span>;
      case 'name':
        return row.name ? (
          <span className="text-foreground/90">{row.name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'description':
        return row.description ? (
          <span className="text-foreground/90">{row.description}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'authentications':
        return row.authentications && row.authentications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.authentications.map(method => (
              <Badge key={method} variant="outline" className="text-xs">
                {method}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'groups':
        return row.groups && row.groups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.groups.map(group => (
              <Badge key={group} variant="secondary" className="text-xs">
                {group}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'tenants':
        return row.tenants && row.tenants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.tenants.map(tenant => (
              <Badge key={tenant} variant="secondary" className="text-xs">
                {tenant}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'superadmin':
        return (
          <span className={row.superadmin ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}>
            {row.superadmin ? '✔' : '✕'}
          </span>
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
              {visibleColumns.map(column => (
                <th key={column.id} className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70 bg-[#2F3341]">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
                {visibleColumns.map(column => (
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
