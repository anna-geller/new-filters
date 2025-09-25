import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "@/components/ExecutionsTable";

export interface InvitationRow {
  email: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  roles: string[];
  groups: string[];
  superadmin: boolean;
  sentAt: string;
  expiredAt: string;
}

interface InvitationsTableProps {
  rows: InvitationRow[];
  columns: ColumnConfig[];
}

const statusStyles: Record<InvitationRow["status"], string> = {
  PENDING: "bg-amber-900/40 text-amber-400 border-amber-700",
  ACCEPTED: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  EXPIRED: "bg-rose-900/40 text-rose-300 border-rose-700",
};

export default function InvitationsTable({ rows, columns }: InvitationsTableProps) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => column.visible).sort((a, b) => a.order - b.order),
    [columns],
  );

  const renderCell = (row: InvitationRow, columnId: string) => {
    switch (columnId) {
      case "email":
        return <span className="font-medium text-foreground">{row.email}</span>;
      case "status":
        return (
          <Badge variant="outline" className={`text-xs border ${statusStyles[row.status]}`}>
            {row.status}
          </Badge>
        );
      case "roles":
        return row.roles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "groups":
        return row.groups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.groups.map((group) => (
              <Badge key={group} variant="secondary" className="text-xs">
                {group}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case "superadmin":
        return (
          <span className={row.superadmin ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
            {row.superadmin ? "✔" : "✕"}
          </span>
        );
      case "sentAt":
        return <span className="text-foreground/90">{row.sentAt}</span>;
      case "expiredAt":
        return <span className="text-foreground/90">{row.expiredAt}</span>;
      default:
        return <span className="text-muted-foreground">—</span>;
    }
  };

  return (
    <Card className="border border-border bg-card/40 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
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
              <tr key={row.email} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
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
