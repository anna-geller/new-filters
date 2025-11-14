export interface TaskProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select' | 'multiselect' | 'enum';
  description: string;
  required?: boolean;
  default?: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
  helpUrl?: string;
}

export interface TaskOutput {
  name: string;
  type: string;
  description: string;
}

export interface TaskMetric {
  name: string;
  type: 'counter' | 'timer' | 'gauge';
  description?: string;
}

export interface TaskMetadata {
  pluginType: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
  properties: TaskProperty[];
  outputs: TaskOutput[];
  metrics: TaskMetric[];
  documentationUrl?: string;
}

export const TASK_METADATA_REGISTRY: Record<string, TaskMetadata> = {
  'io.kestra.plugin.core.debug.Return': {
    pluginType: 'io.kestra.plugin.core.debug.Return',
    displayName: 'Return',
    description: 'Return a value for debugging purposes. This task is mostly useful for troubleshooting. It allows you to return some templated functions, inputs or outputs.',
    category: 'Core',
    properties: [
      {
        name: 'format',
        type: 'string',
        description: 'The templated string to render.',
        required: true,
        placeholder: '{{ outputs.previousTask.value }}',
        helpUrl: 'https://kestra.io/docs/developer-guide/variables'
      }
    ],
    outputs: [
      {
        name: 'value',
        type: 'String',
        description: 'The generated string.'
      }
    ],
    metrics: [
      {
        name: 'duration',
        type: 'timer',
        description: 'Task execution duration'
      },
      {
        name: 'length',
        type: 'counter',
        description: 'Length of the returned value'
      }
    ],
    documentationUrl: 'https://kestra.io/plugins/core/debug/io.kestra.plugin.core.debug.return'
  },
  'io.kestra.plugin.core.log.Log': {
    pluginType: 'io.kestra.plugin.core.log.Log',
    displayName: 'Log',
    description: 'Log a message to the execution logs.',
    category: 'Core',
    properties: [
      {
        name: 'message',
        type: 'string',
        description: 'The message to log.',
        required: true,
        placeholder: 'Processing started at {{ execution.startDate }}'
      },
      {
        name: 'level',
        type: 'select',
        description: 'The log level.',
        required: false,
        default: 'INFO',
        options: [
          { label: 'TRACE', value: 'TRACE' },
          { label: 'DEBUG', value: 'DEBUG' },
          { label: 'INFO', value: 'INFO' },
          { label: 'WARN', value: 'WARN' },
          { label: 'ERROR', value: 'ERROR' }
        ]
      }
    ],
    outputs: [],
    metrics: [
      {
        name: 'duration',
        type: 'timer'
      }
    ]
  }
};

export function getTaskMetadata(pluginType: string): TaskMetadata | undefined {
  return TASK_METADATA_REGISTRY[pluginType];
}

export interface ExecutionContext {
  id: string;
  namespace: string;
  flowId: string;
  flowRevision: number;
  startDate: string;
  state?: string;
}

export const DEFAULT_EXECUTION_CONTEXT: ExecutionContext = {
  id: 'exec_preview_123',
  namespace: 'company.team',
  flowId: 'my-flow',
  flowRevision: 1,
  startDate: new Date().toISOString(),
  state: 'RUNNING'
};
