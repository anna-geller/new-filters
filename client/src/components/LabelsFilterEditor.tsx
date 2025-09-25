import KeyValueFilterEditor, {
  KeyValueFilterOption,
} from './KeyValueFilterEditor';

const labelOptions: KeyValueFilterOption[] = [
  {
    id: 'env:production',
    label: 'env:production',
    color: 'bg-blue-500',
    description: 'Production environment',
  },
  {
    id: 'env:staging',
    label: 'env:staging',
    color: 'bg-yellow-500',
    description: 'Staging environment',
  },
  {
    id: 'env:development',
    label: 'env:development',
    color: 'bg-green-500',
    description: 'Development environment',
  },
  {
    id: 'team:backend',
    label: 'team:backend',
    color: 'bg-purple-500',
    description: 'Backend team assignments',
  },
  {
    id: 'team:frontend',
    label: 'team:frontend',
    color: 'bg-cyan-500',
    description: 'Frontend team assignments',
  },
  {
    id: 'team:analytics',
    label: 'team:analytics',
    color: 'bg-orange-500',
    description: 'Analytics team assignments',
  },
  {
    id: 'team:security',
    label: 'team:security',
    color: 'bg-red-500',
    description: 'Security team assignments',
  },
  {
    id: 'priority:critical',
    label: 'priority:critical',
    color: 'bg-pink-500',
    description: 'Critical priority executions',
  },
  {
    id: 'type:maintenance',
    label: 'type:maintenance',
    color: 'bg-indigo-500',
    description: 'Maintenance type operations',
  },
  {
    id: 'type:security-scan',
    label: 'type:security-scan',
    color: 'bg-slate-500',
    description: 'Security scanning operations',
  },
];

interface LabelsFilterEditorProps {
  selectedLabels: string[];
  selectedOperator: string;
  customValue?: string;
  onSelectionChange: (labels: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function LabelsFilterEditor({
  selectedLabels,
  selectedOperator,
  customValue = '',
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose,
  onReset,
}: LabelsFilterEditorProps) {
  return (
    <KeyValueFilterEditor
      entityNames={{ singular: 'Label', plural: 'Labels' }}
      options={labelOptions}
      selectedValues={selectedLabels}
      selectedOperator={selectedOperator}
      customValue={customValue}
      onSelectionChange={onSelectionChange}
      onOperatorChange={onOperatorChange}
      onCustomValueChange={onCustomValueChange}
      onClose={onClose}
      onReset={onReset}
      dataTestIdPrefix="labels"
    />
  );
}
