import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SuperadminFilterEditorProps {
  selectedValue: string;
  onSelectionChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

const SUPERADMIN_OPTIONS = [
  { id: 'all', label: 'All Users' },
  { id: 'true', label: 'Superadmin' },
  { id: 'false', label: 'Non-Superadmin' }
];

export default function SuperadminFilterEditor({
  selectedValue,
  onSelectionChange,
  onClose,
  onReset,
}: SuperadminFilterEditorProps) {
  const [currentValue, setCurrentValue] = useState(selectedValue);

  useEffect(() => {
    setCurrentValue(selectedValue);
  }, [selectedValue]);

  const handleApply = () => {
    onSelectionChange(currentValue);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentValue('all');
    }
  };

  return (
    <Card className="w-64 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 space-y-4">
        <Select value={currentValue} onValueChange={setCurrentValue}>
          <SelectTrigger data-testid="select-superadmin-value">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPERADMIN_OPTIONS.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="px-2"
            data-testid="button-superadmin-reset"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1"
            data-testid="button-superadmin-apply"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}