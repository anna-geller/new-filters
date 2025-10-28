export interface AssetFlowLink {
  namespace?: string;
  flow: string;
}

export interface AssetRecord {
  id: string;
  type: string;
  namespace: string;
  displayName?: string;
  description?: string;
  values?: Record<string, unknown>;
  relatedAssets?: string[];
  relatedApps?: string[];
  relatedFlows?: AssetFlowLink[];
  executions?: AssetExecutionSummary[];
  emitEvents?: boolean;
}

export interface AssetExecutionSummary {
  id: string;
  namespace: string;
  flow: string;
  taskId: string;
  status:
    | "SUCCESS"
    | "WARNING"
    | "FAILED"
    | "RUNNING"
    | "QUEUED"
    | "PAUSED"
    | "CANCELLED"
    | "RESTARTED"
    | "CREATED";
  timestamp: string;
  note?: string;
}
