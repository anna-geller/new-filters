import { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, RotateCcw, CheckCircle } from "lucide-react";

export interface MultiSelectOption {
  id: string;
  label: string;
  description?: string;
}

export interface MultiSelectFilterEditorProps {
  title: string;
  description?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  selectedOperator: 'in' | 'not-in';
  onSelectionChange: (values: string[]) => void;
  onOperatorChange: (operator: 'in' | 'not-in') => void;
  onClose: () => void;
  onReset?: () => void;
  searchPlaceholder?: string;
  dataTestIdPrefix?: string;
}

export default function MultiSelectFilterEditor({
  title,
  description,
  options,
  selectedValues,
  selectedOperator,
  onSelectionChange,
  onOperatorChange,
  onClose,
  onReset,
  searchPlaceholder = 'Search options...',
  dataTestIdPrefix,
}: MultiSelectFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedValues);
  const [currentOperator, setCurrentOperator] = useState<'in' | 'not-in'>(selectedOperator);

  const prefix = dataTestIdPrefix ?? title.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    setCurrentSelection(selectedValues);
  }, [selectedValues]);

  useEffect(() => {
    setCurrentOperator(selectedOperator);
  }, [selectedOperator]);

  const filteredOptions = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(lower) || option.description?.toLowerCase().includes(lower)
    );
  }, [options, searchTerm]);

  const handleToggleValue = (value: string) => {
    setCurrentSelection(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredOptions.map(option => option.id);
    setCurrentSelection(prev => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleDeselectAll = () => {
    const visibleIds = new Set(filteredOptions.map(option => option.id));
    setCurrentSelection(prev => prev.filter(id => !visibleIds.has(id)));
  };

  const handleApply = () => {
    onSelectionChange(currentSelection);
    onOperatorChange(currentOperator);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setCurrentSelection([]);
      setCurrentOperator('in');
    } else {
      setCurrentSelection(selectedValues);
      setCurrentOperator(selectedOperator);
    }
  };

  const allVisibleSelected = filteredOptions.length > 0 && filteredOptions.every(option => currentSelection.includes(option.id));
  const noneVisibleSelected = filteredOptions.every(option => !currentSelection.includes(option.id));

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="mb-3">
          <h3 className="text-sm font-medium">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Filter Operator
            </label>
            <Select value={currentOperator} onValueChange={(value) => setCurrentOperator(value as 'in' | 'not-in')}>
              <SelectTrigger data-testid={`select-${prefix}-operator`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="not-in">not in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            data-testid={`input-${prefix}-search`}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredOptions.length === 0 || allVisibleSelected}
              className="flex-1"
              data-testid={`button-${prefix}-select-all`}
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Select all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={filteredOptions.length === 0 || noneVisibleSelected}
              className="flex-1"
              data-testid={`button-${prefix}-deselect-all`}
            >
              <Square className="w-3 h-3 mr-1" />
              Deselect all
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No options found</div>
        ) : (
          filteredOptions.map(option => {
            const isSelected = currentSelection.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleValue(option.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 border-b border-border/50 hover:bg-muted/40 transition text-left ${
                  isSelected ? 'bg-primary/10' : ''
                }`}
                data-testid={`option-${prefix}-${option.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground truncate">{option.description}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {currentSelection.length} of {options.length} selected
          </span>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="px-2"
                    data-testid={`button-${prefix}-reset`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to default</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1"
              data-testid={`button-${prefix}-apply`}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
