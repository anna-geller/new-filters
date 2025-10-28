import type { MouseEvent } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ColumnConfig } from "@/types/savedFilters";
import type { AssetExecutionSummary } from "@/types/assets";
import { Link, useLocation } from "wouter";
import { ExternalLink } from "lucide-react";
import { composeAssetKey, parseAssetKey } from "@/utils/assetKeys";

export interface AssetTableFlowLink {
  namespace?: string;
  flow: string;
}

export interface AssetTableRow {
  id: string;
  namespace: string;
  displayName?: string;
  description?: string;
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
  id: "min-w-[7rem] max-w-[10rem] lg:max-w-[12rem]",
  namespace: "min-w-[7rem] max-w-[12rem]",
  displayName: "min-w-[8rem] max-w-[14rem]",
  type: "min-w-[6rem] max-w-[8rem]",
  description: "min-w-[8rem] max-w-[18rem]",
  relatedAssets: "min-w-[9rem] max-w-[18rem]",
  relatedApps: "min-w-[9rem] max-w-[18rem]",
  relatedFlows: "min-w-[11rem] max-w-[20rem]",
  lastExecution: "min-w-[6rem] max-w-[8rem]",
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

  const handleRowClick = (namespace: string, assetId: string) => {
    const safeNamespace = namespace.trim();
    setLocation(safeNamespace ? `/assets/${safeNamespace}/${assetId}` : `/assets/${assetId}`);
  };

  const handleTagClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const renderIdCell = (row: AssetTableRow) => (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href={row.namespace ? `/assets/${row.namespace}/${row.id}` : `/assets/${row.id}`}
        className="min-w-0 flex-1 truncate font-mono text-sm text-[#A3A4DF] hover:text-[#C2C3FF]"
        onClick={handleTagClick}
        title={row.id}
      >
        {row.id}
      </Link>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </div>
  );

  const renderRelatedAssets = (row: AssetTableRow) => {
    const related = row.relatedAssets ?? [];
    if (related.length === 0) {
      return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {related.map((assetKey) => {
          const { namespace, id } = parseAssetKey(assetKey);
          const displayLabel = namespace ? `${namespace}/${id}` : id || assetKey;
          const href =
            namespace && id ? `/assets/${namespace}/${id}` : undefined;
          const badge = (
            <Badge variant="outline" className={assetBadgeClass} title={displayLabel}>
              {displayLabel}
            </Badge>
          );

          if (!href) {
            return (
              <span key={assetKey} className="no-underline">
                {badge}
              </span>
            );
          }

          return (
            <Link
              key={assetKey}
              href={href}
              onClick={handleTagClick}
              className="no-underline"
            >
              {badge}
            </Link>
          );
        })}
      </div>
    );
  };

  const renderRelatedApps = (row: AssetTableRow) => {
    const related = row.relatedApps ?? [];
    if (related.length === 0) {
      return <span className="text-xs text-muted-foreground">None</span>;
    }

    return (
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {related.map((appId) => (
          <Link
            key={appId}
            href={`/apps?search=${encodeURIComponent(appId)}`}
            onClick={handleTagClick}
            className="no-underline"
          >
            <Badge variant="outline" className={appBadgeClass} title={appId}>
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
      <div className="flex min-w-0 flex-col gap-1.5">
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
              <Badge variant="outline" className={flowBadgeClass} title={label}>
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
      case "namespace":
        return (
          <span className="block truncate font-mono text-xs text-muted-foreground" title={row.namespace}>
            {row.namespace}
          </span>
        );
      case "displayName":
        return (
          <span className="text-sm font-medium text-foreground truncate" title={row.displayName ?? row.id}>
            {row.displayName ?? "—"}
          </span>
        );
      case "description":
        return row.description ? (
          <span className="text-sm text-muted-foreground line-clamp-2" title={row.description}>
            {row.description}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
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
      <div className="overflow-x-auto md:overflow-visible">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-3 py-3 text-left font-medium text-muted-foreground align-top bg-[#2F3341] ${columnWidths[column.id] ?? "min-w-[8rem] max-w-[14rem]"}`}
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
                key={composeAssetKey(row.namespace, row.id)}
                className="border-b border-border last:border-b-0 hover:bg-card/40 cursor-pointer"
                onClick={() => handleRowClick(row.namespace, row.id)}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-3 py-3 align-top text-foreground bg-[#262A35] ${columnWidths[column.id] ?? "min-w-[8rem] max-w-[14rem]"}`}
                  >
                    <div className="flex min-h-[32px] min-w-0 items-start overflow-hidden">
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
