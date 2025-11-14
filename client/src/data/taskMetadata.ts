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
  '__output_node__': {
    pluginType: '__output_node__',
    displayName: 'Flow Output',
    description: 'Define an output value for the flow',
    category: 'Flow',
    properties: [
      {
        name: 'type',
        type: 'select',
        description: 'The data type of the output',
        required: true,
        default: 'STRING',
        options: [
          { label: 'STRING', value: 'STRING' },
          { label: 'NUMBER', value: 'NUMBER' },
          { label: 'BOOLEAN', value: 'BOOLEAN' },
          { label: 'OBJECT', value: 'OBJECT' },
          { label: 'ARRAY', value: 'ARRAY' }
        ]
      },
      {
        name: 'id',
        type: 'string',
        description: 'Unique identifier for this output',
        required: true,
        placeholder: 'output_name'
      },
      {
        name: 'displayName',
        type: 'string',
        description: 'Human-readable name for the output',
        required: false,
        placeholder: 'Order ID'
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of what this output represents',
        required: false,
        placeholder: 'The unique identifier for the order'
      },
      {
        name: 'validator',
        type: 'string',
        description: 'Regular expression pattern to validate the output value',
        required: false,
        placeholder: '^[a-zA-Z]+$'
      },
      {
        name: 'prefill',
        type: 'string',
        description: 'Default/prefill value for the output',
        required: false,
        placeholder: ''
      },
      {
        name: 'value',
        type: 'string',
        description: 'The value expression for this output',
        required: true,
        placeholder: '{{ outputs.task1.value }}'
      },
      {
        name: 'required',
        type: 'boolean',
        description: 'Whether this output is required',
        required: false,
        default: false
      }
    ],
    outputs: [],
    metrics: []
  },
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
