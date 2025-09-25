import { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from './ExecutionsTable';

export interface AuditLogActor {
  label: string;
  url?: string;
}

export interface AuditLogRow {
  id: string;
  resourceType: string;
  action: string;
  actor: AuditLogActor;
  details: string;
  date: string;
  tenant?: string;
}

export const tenantAuditLogColumns: ColumnConfig[] = [
  { id: 'resource-type', label: 'Resource Type', description: 'Type of resource affected', visible: true, order: 1 },
  { id: 'action', label: 'Action', description: 'Action type performed', visible: true, order: 2 },
  { id: 'actor', label: 'Actor', description: 'User or Service who performed the action', visible: true, order: 3 },
  { id: 'details', label: 'Details', description: 'Additional details about the action', visible: true, order: 4 },
  { id: 'date', label: 'Date', description: 'When the action occurred', visible: true, order: 5 },
];

export const instanceAuditLogColumns: ColumnConfig[] = [
  ...tenantAuditLogColumns,
  { id: 'tenant', label: 'Tenant', description: 'Associated tenant ID', visible: true, order: 6 },
];

interface AuditLogsTableProps {
  rows: AuditLogRow[];
  columns: ColumnConfig[];
}

export default function AuditLogsTable({ rows, columns }: AuditLogsTableProps) {
  const visibleColumns = useMemo(
    () =>
      columns
        .filter(column => column.visible)
        .sort((a, b) => a.order - b.order),
    [columns],
  );

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="bg-surface/60 text-muted-foreground">
              {visibleColumns.map(column => (
                <th key={column.id} className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70 text-muted-foreground">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
                {visibleColumns.map(column => {
                  switch (column.id) {
                    case 'resource-type':
                      return (
                        <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {row.resourceType}
                          </Badge>
                        </td>
                      );
                    case 'action':
                      return (
                        <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                          <Badge variant="outline" className="uppercase tracking-wide">
                            {row.action}
                          </Badge>
                        </td>
                      );
                    case 'actor':
                      return (
                        <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                          {row.actor.url ? (
                            <a
                              href={row.actor.url}
                              className="text-primary hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {row.actor.label}
                            </a>
                          ) : (
                            <span className="text-foreground/90">{row.actor.label}</span>
                          )}
                        </td>
                      );
                    case 'details':
                      return (
                        <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                          <div className="text-xs text-foreground/80 whitespace-pre-line font-mono leading-relaxed">
                            {row.details}
                          </div>
                        </td>
                      );
                    case 'date':
                      return (
                        <td key={column.id} className="py-3 px-4 align-top whitespace-nowrap text-muted-foreground bg-[#262A35]">
                          {row.date}
                        </td>
                      );
                    case 'tenant':
                      return (
                        <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                          <Badge variant="outline" className="uppercase tracking-wide">
                            {row.tenant ?? '—'}
                          </Badge>
                        </td>
                      );
                    default:
                      return (
                        <td key={column.id} className="py-3 px-4 align-top">
                          —
                        </td>
                      );
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
