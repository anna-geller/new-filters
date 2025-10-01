import { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from './ExecutionsTable';
import type { DetailFilter } from "@/types/auditLogs";
import { extractDetailPairs } from "@/utils/auditLogFilterUtils";

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

const SHARED_COLUMNS = [
  { id: 'resource-type', label: 'Resource Type', description: 'Type of resource affected', visible: true, order: 1 },
  { id: 'action', label: 'Action', description: 'Action type performed', visible: true, order: 2 },
  { id: 'actor', label: 'Actor', description: 'User or Service who performed the action', visible: true, order: 3 },
  { id: 'details', label: 'Details', description: 'Additional details about the action', visible: true, order: 4 },
  { id: 'date', label: 'Date', description: 'When the action occurred', visible: true, order: 5 },
] as const;

const TENANT_COLUMN = { id: 'tenant', label: 'Tenant', description: 'Associated tenant ID', visible: true, order: 6 } as const;

export const tenantAuditLogColumns: ColumnConfig[] = [...SHARED_COLUMNS];

export const instanceAuditLogColumns: ColumnConfig[] = [...SHARED_COLUMNS, TENANT_COLUMN];

interface AuditLogsTableProps {
  rows: AuditLogRow[];
  columns: ColumnConfig[];
  onDetailClick?: (detail: DetailFilter) => void;
}

export default function AuditLogsTable({ rows, columns, onDetailClick }: AuditLogsTableProps) {
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
                <th key={column.id} className="text-left font-semibold text-xs md:text-sm py-3 px-4 border-b border-border/70 text-muted-foreground bg-[#2F3341]">
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
                            <span className="text-foreground/90">{row.actor.label}</span>
                          ) : (
                            <span className="text-foreground/90">{row.actor.label}</span>
                          )}
                        </td>
                      );
                    case 'details': {
                      const detailPairs = extractDetailPairs(row.details);
                      if (detailPairs.length > 0) {
                        return (
                          <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                            <div className="flex flex-wrap gap-1">
                              {detailPairs.map((pair, index) => {
                                const isClickable = typeof onDetailClick === 'function';
                                const content = `${pair.key}:${pair.value}`;
                                const keyToken = pair.key.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '').toLowerCase();
                                const valueToken = pair.value.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '').toLowerCase();
                                const badgeClasses = `text-xs font-mono whitespace-nowrap transition-all duration-200 ${
                                  isClickable
                                    ? 'cursor-pointer hover:bg-blue-500/20 hover:border-blue-400 hover:text-blue-200 border-border/40 text-foreground/80 hover:scale-105 active:scale-95'
                                    : 'border-border/50 text-foreground/80'
                                }`;
                                return (
                                  <Badge
                                    key={`${row.id}-detail-${pair.key}-${pair.value}-${index}`}
                                    variant="outline"
                                    className={badgeClasses}
                                    onClick={isClickable ? () => onDetailClick(pair) : undefined}
                                    data-testid={`audit-detail-${keyToken}-${valueToken}`}
                                  >
                                    {content}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={column.id} className="py-3 px-4 align-top bg-[#262A35]">
                          <div className="text-xs text-foreground/80 whitespace-pre-line font-mono leading-relaxed">
                            {row.details}
                          </div>
                        </td>
                      );
                    }
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
