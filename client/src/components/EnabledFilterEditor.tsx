import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, RotateCcw } from "lucide-react";

export interface EnabledOption {
  id: string;
  label: string;
}

interface EnabledFilterEditorProps {
  selectedValue: string | null;
  options: EnabledOption[];
  onSelectionChange: (value: string | null) => void;
  onClose: () => void;
  onReset?: () => void;
}

const defaultOptions: EnabledOption[] = [
  { id: 'true', label: 'True' },
  { id: 'false', label: 'False' },
];

export default function EnabledFilterEditor({
  selectedValue,
  options = defaultOptions,
  onSelectionChange,
  onClose,
  onReset,
}: EnabledFilterEditorProps) {
  const [currentValue, setCurrentValue] = useState<string | null>(selectedValue);

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
      setCurrentValue(null);
    }
  };

  return (
    <Card className="w-64 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = currentValue === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setCurrentValue(option.id)}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
                data-testid={`enabled-option-${option.id}`}
              >
                <Radio className={`h-4 w-4 ${isSelected ? 'fill-current' : 'text-muted-foreground'}`} />
                <span className="flex-1 font-medium">{option.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setCurrentValue(null)}
            className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              currentValue === null
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                : 'border-border hover:bg-muted/40 text-muted-foreground'
            }`}
            data-testid="enabled-option-any"
          >
            <Radio className={`h-4 w-4 ${currentValue === null ? 'fill-current' : 'text-muted-foreground'}`} />
            <span className="flex-1 font-medium">Any</span>
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {currentValue === null ? 'Showing all apps' : `Showing ${currentValue === 'true' ? 'enabled' : 'disabled'} apps`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="px-2"
            data-testid="button-reset-enabled-filter"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleApply} className="flex-1" data-testid="button-apply-enabled-filter">
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
