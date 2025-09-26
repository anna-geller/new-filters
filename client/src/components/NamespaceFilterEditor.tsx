import MultiSelectFilterEditor, { type MultiSelectOption } from './MultiSelectFilterEditor';

const namespaceOptions = [
  'company',
  'company.team',
  'company.team.backend',
  'company.team.frontend',
  'company.team.api',
  'company.analytics',
  'company.security',
  'company.team.database',
];

const testsNamespaceOptions = [
  'company',
  'company.team',
  'company.backend',
  'tutorial',
];

interface NamespaceFilterEditorProps {
  selectedNamespaces: string[];
  namespaceOperator: string;
  customValue: string;
  onSelectionChange: (namespaces: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
  mode?: 'executions' | 'tests';
  options?: string[];
}

export default function NamespaceFilterEditor({
  selectedNamespaces,
  namespaceOperator,
  customValue,
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose,
  onReset,
  mode = 'executions',
  options,
}: NamespaceFilterEditorProps) {
  const baseOptions = mode === 'tests' ? testsNamespaceOptions : namespaceOptions;
  const availableNamespaces = options ?? baseOptions;

  // Convert namespace strings to MultiSelectOption objects
  const namespaceMultiSelectOptions: MultiSelectOption[] = availableNamespaces.map(namespace => ({
    id: namespace,
    label: namespace,
    description: `Namespace: ${namespace}`
  }));

  // Convert operator to 'in' | 'not-in' for MultiSelectFilterEditor
  const convertedOperator = namespaceOperator === 'not-in' ? 'not-in' : 'in';

  const handleOperatorChange = (operator: 'in' | 'not-in') => {
    onOperatorChange(operator);
  };

  return (
    <MultiSelectFilterEditor
      title="Namespace"
      description="Filter by namespace to which the execution belongs"
      options={namespaceMultiSelectOptions}
      selectedValues={selectedNamespaces}
      selectedOperator={convertedOperator}
      onSelectionChange={onSelectionChange}
      onOperatorChange={handleOperatorChange}
      onClose={onClose}
      onReset={onReset}
      searchPlaceholder="Search namespaces..."
      dataTestIdPrefix="namespaces"
    />
  );
}