import MultiSelectFilterEditor, { type MultiSelectOption } from './MultiSelectFilterEditor';

const RESOURCE_OPTIONS: MultiSelectOption[] = [
  { id: 'Auditlog', label: 'Auditlog' },
  { id: 'App', label: 'App' },
  { id: 'App Execution', label: 'App Execution' },
  { id: 'Blueprint', label: 'Blueprint' },
  { id: 'Binding', label: 'Binding' },
  { id: 'Dashboard', label: 'Dashboard' },
  { id: 'Execution', label: 'Execution' },
  { id: 'Flow', label: 'Flow' },
  { id: 'Group', label: 'Group' },
  { id: 'Invitation', label: 'Invitation' },
  { id: 'Kv Store', label: 'Kv Store' },
  { id: 'Namespace', label: 'Namespace' },
  { id: 'Namespace File', label: 'Namespace File' },
  { id: 'Role', label: 'Role' },
  { id: 'Security Integration', label: 'Security Integration' },
  { id: 'Secret', label: 'Secret' },
  { id: 'Setting', label: 'Setting' },
  { id: 'Template', label: 'Template' },
  { id: 'Tenant', label: 'Tenant' },
  { id: 'Tenant Access', label: 'Tenant Access' },
  { id: 'Testsuite', label: 'Testsuite' },
  { id: 'Testsuite Run', label: 'Testsuite Run' },
  { id: 'Versioned Plugin', label: 'Versioned Plugin' },
  { id: 'User', label: 'User' },
  { id: 'Worker Group', label: 'Worker Group' },
  { id: 'Instance', label: 'Instance' },
];

interface ResourceFilterEditorProps {
  selectedResources: string[];
  operator: 'in' | 'not-in';
  onSelectionChange: (resources: string[]) => void;
  onOperatorChange: (operator: 'in' | 'not-in') => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function ResourceFilterEditor({
  selectedResources,
  operator,
  onSelectionChange,
  onOperatorChange,
  onClose,
  onReset,
}: ResourceFilterEditorProps) {
  return (
    <MultiSelectFilterEditor
      title="Resource"
      description="Filter by the affected resource type"
      options={RESOURCE_OPTIONS}
      selectedValues={selectedResources}
      selectedOperator={operator}
      onSelectionChange={onSelectionChange}
      onOperatorChange={onOperatorChange}
      onClose={onClose}
      onReset={onReset}
      searchPlaceholder="Search resources..."
      dataTestIdPrefix="resources"
    />
  );
}
