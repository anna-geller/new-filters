import KeyValueFilterEditor, {
  KeyValueFilterOption,
} from './KeyValueFilterEditor';

const inputOptions: KeyValueFilterOption[] = [
  {
    id: 'customer_id:98213',
    label: 'customer_id:98213',
    color: 'bg-sky-500',
    description: 'Customer identifier supplied by the trigger',
  },
  {
    id: 'region:us-east-1',
    label: 'region:us-east-1',
    color: 'bg-amber-500',
    description: 'Requested deployment region',
  },
  {
    id: 'plan:enterprise',
    label: 'plan:enterprise',
    color: 'bg-lime-500',
    description: 'Subscription tier provided at submission time',
  },
  {
    id: 'feature_flag:new-filters',
    label: 'feature_flag:new-filters',
    color: 'bg-fuchsia-500',
    description: 'Feature flag toggles included with the execution',
  },
  {
    id: 'retry_count:0',
    label: 'retry_count:0',
    color: 'bg-rose-500',
    description: 'Number of retries prior to execution',
  },
  {
    id: 'source:cli',
    label: 'source:cli',
    color: 'bg-emerald-500',
    description: 'Origin of the execution request',
  },
  {
    id: 'priority:high',
    label: 'priority:high',
    color: 'bg-indigo-500',
    description: 'Priority level attached to the run',
  },
  {
    id: 'dataset:daily-sync',
    label: 'dataset:daily-sync',
    color: 'bg-cyan-500',
    description: 'Dataset alias resolved during execution',
  },
  {
    id: 'correlation_id:12ab-45cd',
    label: 'correlation_id:12ab-45cd',
    color: 'bg-slate-500',
    description: 'Correlation identifier propagated downstream',
  },
  {
    id: 'trigger:api',
    label: 'trigger:api',
    color: 'bg-violet-500',
    description: 'Triggering mechanism captured in input payload',
  },
];

interface InputsFilterEditorProps {
  selectedInputs: string[];
  selectedOperator: string;
  customValue?: string;
  onSelectionChange: (inputs: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function InputsFilterEditor({
  selectedInputs,
  selectedOperator,
  customValue = '',
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose,
  onReset,
}: InputsFilterEditorProps) {
  return (
    <KeyValueFilterEditor
      entityNames={{ singular: 'Input', plural: 'Inputs' }}
      options={inputOptions}
      selectedValues={selectedInputs}
      selectedOperator={selectedOperator}
      customValue={customValue}
      onSelectionChange={onSelectionChange}
      onOperatorChange={onOperatorChange}
      onCustomValueChange={onCustomValueChange}
      onClose={onClose}
      onReset={onReset}
      dataTestIdPrefix="inputs"
    />
  );
}
