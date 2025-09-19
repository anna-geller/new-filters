import KeyValueFilterEditor, {
  KeyValueFilterOption,
} from './KeyValueFilterEditor';

const outputOptions: KeyValueFilterOption[] = [
  {
    id: 'status:success',
    label: 'status:success',
    color: 'bg-green-500',
    description: 'Terminal status emitted by the execution',
  },
  {
    id: 'records_processed:4201',
    label: 'records_processed:4201',
    color: 'bg-orange-500',
    description: 'Total number of processed items',
  },
  {
    id: 'duration_ms:3150',
    label: 'duration_ms:3150',
    color: 'bg-blue-500',
    description: 'Execution time measured in milliseconds',
  },
  {
    id: 'error_code:none',
    label: 'error_code:none',
    color: 'bg-slate-500',
    description: 'Error code returned to callers',
  },
  {
    id: 'result_path:s3://prefect/results/2025-07-24',
    label: 'result_path:s3://prefect/results/2025-07-24',
    color: 'bg-purple-500',
    description: 'Pointer to persisted outputs',
  },
  {
    id: 'alerts_sent:false',
    label: 'alerts_sent:false',
    color: 'bg-red-500',
    description: 'Whether downstream alerts were triggered',
  },
  {
    id: 'records_failed:0',
    label: 'records_failed:0',
    color: 'bg-amber-500',
    description: 'Failed record count emitted in summary',
  },
  {
    id: 'task_id:finalize-report',
    label: 'task_id:finalize-report',
    color: 'bg-indigo-500',
    description: 'Task identifier associated with the final step output',
  },
  {
    id: 'retry_scheduled:false',
    label: 'retry_scheduled:false',
    color: 'bg-teal-500',
    description: 'Retry scheduling outcome reported by the flow',
  },
  {
    id: 'notified_channels:slack',
    label: 'notified_channels:slack',
    color: 'bg-cyan-500',
    description: 'Notification channels reached by the run',
  },
];

interface OutputsFilterEditorProps {
  selectedOutputs: string[];
  selectedOperator: string;
  customValue?: string;
  onSelectionChange: (outputs: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function OutputsFilterEditor({
  selectedOutputs,
  selectedOperator,
  customValue = '',
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose,
  onReset,
}: OutputsFilterEditorProps) {
  return (
    <KeyValueFilterEditor
      entityNames={{ singular: 'Output', plural: 'Outputs' }}
      options={outputOptions}
      selectedValues={selectedOutputs}
      selectedOperator={selectedOperator}
      customValue={customValue}
      onSelectionChange={onSelectionChange}
      onOperatorChange={onOperatorChange}
      onCustomValueChange={onCustomValueChange}
      onClose={onClose}
      onReset={onReset}
      dataTestIdPrefix="outputs"
    />
  );
}
