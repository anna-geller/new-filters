// Canvas node types matching Kestra flow elements
export type FlowCanvasNodeType = 
  | 'task'
  | 'trigger'
  | 'input'
  | 'output'
  | 'error'
  | 'finally'
  | 'listener'
  | 'note';

// Configuration for different node types
export interface TaskNodeConfig {
  id: string;
  type: string; // Plugin type (e.g., io.kestra.plugin.core.log.Log)
  description?: string;
  [key: string]: any; // Additional task-specific properties
}

export interface TriggerNodeConfig {
  id: string;
  type: string; // Trigger type (e.g., io.kestra.plugin.core.trigger.Schedule)
  description?: string;
  [key: string]: any; // Additional trigger-specific properties
}

export interface InputNodeConfig {
  id: string;
  type: string; // Input type (e.g., STRING, INT, BOOLEAN)
  description?: string;
  required?: boolean;
  defaults?: any;
  [key: string]: any;
}

export interface OutputNodeConfig {
  id: string;
  type: string;
  value?: string;
  [key: string]: any;
}

export interface ErrorHandlerConfig {
  id: string;
  type: string;
  description?: string;
  [key: string]: any;
}

export interface FinallyNodeConfig {
  id: string;
  type: string;
  description?: string;
  [key: string]: any;
}

export interface ListenerNodeConfig {
  id: string;
  type: string;
  description?: string;
  [key: string]: any;
}

export interface NoteNodeConfig {
  text: string;
  color?: string;
}

export type NodeConfig = 
  | TaskNodeConfig
  | TriggerNodeConfig
  | InputNodeConfig
  | OutputNodeConfig
  | ErrorHandlerConfig
  | FinallyNodeConfig
  | ListenerNodeConfig
  | NoteNodeConfig;

// Flow canvas node matching ReactFlow's Node interface
export interface FlowCanvasNode {
  id: string;
  type: FlowCanvasNodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: NodeConfig;
  };
  width?: number;
  height?: number;
}

// Flow canvas edge matching ReactFlow's Edge interface
export interface FlowCanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'dependency' | 'smoothstep' | 'step';
  animated?: boolean;
  style?: Record<string, any>;
  markerEnd?: Record<string, any>;
}

// Complete canvas data structure
export interface FlowCanvasData {
  nodes: FlowCanvasNode[];
  edges: FlowCanvasEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

// JSON Canvas format (jsoncanvas.org spec)
export interface JsonCanvasNode {
  id: string;
  type: 'text' | 'file' | 'link' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  text?: string; // for text nodes
  file?: string; // for file nodes
  url?: string; // for link nodes
}

export interface JsonCanvasEdge {
  id: string;
  fromNode: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toNode: string;
  toSide?: 'top' | 'right' | 'bottom' | 'left';
  color?: string;
  label?: string;
}

export interface JsonCanvasData {
  nodes: JsonCanvasNode[];
  edges: JsonCanvasEdge[];
}

// Flow-level properties that can be edited in the properties panel
export interface FlowProperties {
  id: string;
  namespace: string;
  description?: string;
  disabled?: boolean;
  deleted?: boolean;
  revision?: number;
  tenantId?: string;
  
  // Concurrency configuration
  concurrency?: {
    behavior?: 'QUEUE' | 'CANCEL' | 'FAIL';
    limit?: number;
    slots?: Array<{
      id: string;
      label?: string;
      limit: number;
      default?: boolean;
    }>;
  };
  
  // Arrays of flow elements
  inputs?: Array<{
    id: string;
    type: string;
    description?: string;
    required?: boolean;
    defaults?: any;
    [key: string]: any;
  }>;
  
  outputs?: Array<{
    id: string;
    type: string;
    value?: string;
    [key: string]: any;
  }>;
  
  tasks?: Array<{
    id: string;
    type: string;
    description?: string;
    [key: string]: any;
  }>;
  
  triggers?: Array<{
    id: string;
    type: string;
    description?: string;
    [key: string]: any;
  }>;
  
  errors?: Array<{
    id: string;
    type: string;
    description?: string;
    [key: string]: any;
  }>;
  
  finally?: Array<{
    id: string;
    type: string;
    description?: string;
    [key: string]: any;
  }>;
  
  listeners?: Array<{
    id: string;
    type: string;
    description?: string;
    [key: string]: any;
  }>;
  
  // Key-value configurations
  labels?: Record<string, string>;
  variables?: Record<string, any>;
  taskDefaults?: Record<string, any>;
  pluginDefaults?: Record<string, any>;
  
  // Advanced configurations
  afterExecution?: {
    onSuccess?: string;
    onFailure?: string;
    [key: string]: any;
  };
  
  retry?: {
    type?: 'constant' | 'exponential';
    maxAttempt?: number;
    maxDuration?: string;
    [key: string]: any;
  };
  
  sla?: {
    id?: string;
    duration?: string;
    [key: string]: any;
  };
  
  workerGroup?: string;
}

