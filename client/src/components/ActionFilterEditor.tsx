import MultiSelectFilterEditor, { type MultiSelectOption } from './MultiSelectFilterEditor';

const ACTION_OPTIONS: MultiSelectOption[] = [
  { id: 'CREATE', label: 'CREATE', description: 'Create a new resource' },
  { id: 'READ', label: 'READ', description: 'Read resource data' },
  { id: 'UPDATE', label: 'UPDATE', description: 'Modify an existing resource' },
  { id: 'DELETE', label: 'DELETE', description: 'Delete an existing resource' },
  { id: 'LOGIN', label: 'LOGIN', description: 'Authenticate into the platform' },
  { id: 'LOGOUT', label: 'LOGOUT', description: 'Sign out from the platform' },
];

interface ActionFilterEditorProps {
  selectedActions: string[];
  operator: 'in' | 'not-in';
  onSelectionChange: (actions: string[]) => void;
  onOperatorChange: (operator: 'in' | 'not-in') => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function ActionFilterEditor({
  selectedActions,
  operator,
  onSelectionChange,
  onOperatorChange,
  onClose,
  onReset,
}: ActionFilterEditorProps) {
  return (
    <MultiSelectFilterEditor
      title="Action"
      description="Filter by action types recorded in the audit log"
      options={ACTION_OPTIONS}
      selectedValues={selectedActions}
      selectedOperator={operator}
      onSelectionChange={onSelectionChange}
      onOperatorChange={onOperatorChange}
      onClose={onClose}
      onReset={onReset}
      searchPlaceholder="Search actions..."
      dataTestIdPrefix="actions"
    />
  );
}
