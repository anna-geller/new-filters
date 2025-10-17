import type { MouseEvent } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "@/types/savedFilters";
import type { AssetExecutionSummary } from "@/types/assets";
import { Link, useLocation } from "wouter";
import { ExternalLink } from "lucide-react";

export interface AssetTableFlowLink {
  namespace?: string;
  flow: string;
}

export interface AssetTableRow {
  id: string;
  displayName?: string;
  type: string;
  relatedAssets?: string[];
  relatedApps?: string[];
  relatedFlows?: AssetTableFlowLink[];
  lastExecution?: AssetExecutionSummary;
}

interface AssetsTableProps {
  rows: AssetTableRow[];
  columns: ColumnConfig[];
}

const columnWidths: Record<string, string> = {
  id: "w-48 max-w-[12rem]",
  displayName: "w-64 max-w-[16rem]",
  type: "w-36 max-w-[9rem]",
  relatedAssets: "w-80",
  relatedApps: "w-80",
  relatedFlows: "w-96",
  lastExecution: "w-32 max-w-[8rem]",
};

const executionStateStyles: Record<string, string> = {
  SUCCESS: "text-green-300",
  FAILED: "text-red-300",
  RUNNING: "text-blue-300",
  WARNING: "text-amber-300",
  QUEUED: "text-yellow-200",
  PAUSED: "text-slate-200",
  CANCELLED: "text-rose-300",
  RESTARTED: "text-teal-300",
  CREATED: "text-purple-300",
};

const badgeBase = "text-xs border border-border/40 bg-transparent hover:bg-white/5";
const assetBadgeClass = `${badgeBase} text-blue-200 border-blue-500/40`;
const appBadgeClass = `${badgeBase} text-emerald-200 border-emerald-500/40`;
const flowBadgeClass = `${badgeBase} text-purple-200 border-purple-500/40`;

export default function AssetsTable({ rows, columns }: AssetsTableProps) {
  const [, setLocation] = useLocation();

  const visibleColumns = columns
    .filter((column) => column.visible)
    .sort((a, b) => a.order - b.order);

  const handleRowClick = (assetId: string) => {
    setLocation(`/assets/${assetId}`);
  };

  const handleTagClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const renderIdCell = (row: AssetTableRow) => (
    <div className="flex items-center gap-2">
      <Link
        href={`/assets/${row.id}`}
        className="font-mono text-sm text-[#A3A4DF] hover:text-[#C2C3FF] truncate"
        onClick={handleTagClick}
      >
        {row.id}
      </Link>
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  const renderRelatedAssets = (row: AssetTableRow) => {
    const related = row.relatedAssets ?? [];
    if (related.length === 0) {
      return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {related.map((assetId) => (
          <Link
            key={assetId}
            href={`/assets/${assetId}`}
            onClick={handleTagClick}
            className="no-underline"
          >
            <Badge variant="outline" className={assetBadgeClass}>
              {assetId}
            </Badge>
          </Link>
        ))}
      </div>
    );
  };

  const renderRelatedApps = (row: AssetTableRow) => {
    const related = row.relatedApps ?? [];
    if (related.length === 0) {
      return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {related.map((appId) => (
          <Link
            key={appId}
            href={`/apps?search=${encodeURIComponent(appId)}`}
            onClick={handleTagClick}
            className="no-underline"
          >
            <Badge variant="outline" className={appBadgeClass}>
              {appId}
            </Badge>
          </Link>
        ))}
      </div>
    );
  };

  const renderRelatedFlows = (row: AssetTableRow) => {
    const related = row.relatedFlows ?? [];
    if (related.length === 0) {
      return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
      <div className="flex flex-col gap-1.5">
        {related.map((flow) => {
          const namespace = flow.namespace ?? "";
          const label = namespace ? `${namespace}/${flow.flow}` : flow.flow;
          const href = namespace
            ? `/flows?namespace=${encodeURIComponent(namespace)}&flow=${encodeURIComponent(flow.flow)}`
            : `/flows?flow=${encodeURIComponent(flow.flow)}`;
          return (
            <Link
              key={`${namespace}-${flow.flow}`}
              href={href}
              onClick={handleTagClick}
              className="no-underline inline-flex"
            >
              <Badge variant="outline" className={flowBadgeClass}>
                {label}
              </Badge>
            </Link>
          );
        })}
      </div>
    );
  };

  const handleExecutionClick = (event: MouseEvent, executionId: string) => {
    event.stopPropagation();
    setLocation(`/executions/${executionId}`);
  };

  const renderLastExecution = (execution?: AssetExecutionSummary) => {
    if (!execution) {
      return <span className="text-xs text-muted-foreground">No executions</span>;
    }

    const stateClass = executionStateStyles[execution.status] ?? "text-primary";
    return (
      <button
        type="button"
        onClick={(event) => handleExecutionClick(event, execution.id)}
        className={`text-xs font-semibold bg-transparent p-0 leading-5 ${stateClass} hover:underline focus:outline-none`}
        title={new Date(execution.timestamp).toLocaleString()}
      >
        {execution.status}
      </button>
    );
  };

  const renderCell = (row: AssetTableRow, columnId: string) => {
    switch (columnId) {
      case "id":
        return renderIdCell(row);
      case "displayName":
        return (
          <span className="text-sm font-medium text-foreground truncate" title={row.displayName ?? row.id}>
            {row.displayName ?? "—"}
          </span>
        );
      case "type":
        return (
          <Badge variant="secondary" className="text-xs uppercase tracking-wide" title={row.type}>
            {row.type}
          </Badge>
        );
      case "relatedAssets":
        return renderRelatedAssets(row);
      case "relatedApps":
        return renderRelatedApps(row);
      case "relatedFlows":
        return renderRelatedFlows(row);
      case "lastExecution":
        return renderLastExecution(row.lastExecution);
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
                  className={`px-4 py-3 text-left font-medium text-muted-foreground align-top bg-[#2F3341] ${columnWidths[column.id] ?? "w-60"}`}
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
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-card/40 cursor-pointer"
                onClick={() => handleRowClick(row.id)}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 align-top text-foreground bg-[#262A35] ${columnWidths[column.id] ?? "w-60"}`}
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
