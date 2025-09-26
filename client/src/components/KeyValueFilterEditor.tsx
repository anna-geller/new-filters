import { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, CheckCircle, Link2, RotateCcw } from "lucide-react";

export interface KeyValueFilterOption {
  id: string;
  label: string;
  description?: string;
  color?: string;
}

export interface KeyValueEntityNames {
  singular: string;
  plural: string;
}

export interface KeyValueFilterEditorProps {
  entityNames: KeyValueEntityNames;
  options: KeyValueFilterOption[];
  selectedValues: string[];
  selectedOperator: string;
  customValue?: string;
  onSelectionChange: (values: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
  searchPlaceholder?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  dataTestIdPrefix?: string;
}

const baseOperators = (
  entityNames: KeyValueEntityNames,
): { id: string; label: string; description: string }[] => {
  const singular = entityNames.singular;
  const pluralLower = entityNames.plural.toLowerCase();
  return [
    {
      id: 'has-any-of',
      label: 'has any of',
      description: `Matches at least one of the selected ${pluralLower} (OR)`,
    },
    {
      id: 'has-none-of',
      label: 'has none of',
      description: `Matches none of the selected ${pluralLower} (NOT OR)`,
    },
    {
      id: 'has-all-of',
      label: 'has all of',
      description: `Matches all of the selected ${pluralLower} (AND)`,
    },
    {
      id: 'contains',
      label: 'contains',
      description: `${singular} contains the specified text (LIKE)`,
    },
    {
      id: 'does-not-contain',
      label: 'does not contain',
      description: `${singular} does not contain the specified text (NOT LIKE)`,
    },
    {
      id: 'is-set',
      label: 'is set',
      description: `${singular} key exists with any value (IS NOT NULL)`,
    },
    {
      id: 'is-not-set',
      label: 'is not set',
      description: `${singular} key does not exist (IS NULL)`,
    },
  ];
};

export default function KeyValueFilterEditor({
  entityNames,
  options,
  selectedValues,
  selectedOperator,
  customValue = '',
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose,
  onReset,
  searchPlaceholder,
  keyPlaceholder,
  valuePlaceholder,
  dataTestIdPrefix,
}: KeyValueFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentValues, setCurrentValues] = useState(selectedValues);
  const [currentOperator, setCurrentOperator] = useState(selectedOperator);
  const [currentCustomValue, setCurrentCustomValue] = useState(customValue);

  const prefix = dataTestIdPrefix ?? entityNames.singular.toLowerCase();
  const pluralLower = entityNames.plural.toLowerCase();
  const singularLower = entityNames.singular.toLowerCase();

  const operatorOptions = useMemo(() => baseOperators(entityNames), [entityNames]);

  useEffect(() => {
    setCurrentValues(selectedValues);
  }, [selectedValues]);

  useEffect(() => {
    setCurrentOperator(selectedOperator);
  }, [selectedOperator]);

  useEffect(() => {
    setCurrentCustomValue(customValue);
  }, [customValue]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleValue = (valueId: string) => {
    const isSelected = currentValues.includes(valueId);
    if (isSelected) {
      setCurrentValues(currentValues.filter((id) => id !== valueId));
    } else {
      setCurrentValues([...currentValues, valueId]);
    }
  };

  const handleSelectAll = () => {
    const visibleIds = filteredOptions.map((option) => option.id);
    const combined = [...currentValues, ...visibleIds];
    const deduped = Array.from(new Set(combined));
    setCurrentValues(deduped);
  };

  const handleDeselectAll = () => {
    const visibleIds = filteredOptions.map((option) => option.id);
    const remaining = currentValues.filter((id) => !visibleIds.includes(id));
    setCurrentValues(remaining);
  };

  const allVisible = filteredOptions.length > 0 && filteredOptions.every((option) => currentValues.includes(option.id));
  const noneVisible = filteredOptions.every((option) => !currentValues.includes(option.id));

  const selectedOperatorObj = operatorOptions.find((op) => op.id === currentOperator);
  const isTextBasedOperator = ['contains', 'does-not-contain'].includes(currentOperator);
  const isKeyBasedOperator = ['is-set', 'is-not-set'].includes(currentOperator);
  const isSelectionBasedOperator = ['has-any-of', 'has-none-of', 'has-all-of'].includes(currentOperator);

  const handleApply = () => {
    onSelectionChange(currentValues);
    onOperatorChange(currentOperator);
    onCustomValueChange(currentCustomValue);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentValues(selectedValues);
      setCurrentOperator(selectedOperator);
      setCurrentCustomValue(customValue);
    }
  };

  const effectiveSearchPlaceholder = searchPlaceholder ?? `Search ${pluralLower}...`;
  const effectiveKeyPlaceholder =
    keyPlaceholder ?? `Enter ${singularLower} key (e.g. env, team, action)...`;
  const effectiveValuePlaceholder =
    valuePlaceholder ?? `Enter text that ${pluralLower} should ${selectedOperatorObj?.label || 'match'}...`;

  return (
    <Card className="w-96 p-0 bg-[#2F3341] border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border bg-[#2F3341]">
        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Filter Operator
          </label>
          <Select value={currentOperator} onValueChange={setCurrentOperator}>
            <SelectTrigger data-testid={`select-${prefix}-operator`}>
              <SelectValue placeholder="Select operator...">
                {selectedOperatorObj?.label || 'Select operator...'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((operator) => (
                <SelectItem key={operator.id} value={operator.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{operator.label}</span>
                    <span className="text-xs text-muted-foreground">{operator.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTextBasedOperator && (
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Value
            </label>
            <Input
              placeholder={effectiveValuePlaceholder}
              value={currentCustomValue}
              onChange={(e) => setCurrentCustomValue(e.target.value)}
              className="text-sm"
              data-testid={`input-${prefix}-custom-value`}
            />
          </div>
        )}

        {isKeyBasedOperator && (
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              {`${entityNames.singular} Key`}
            </label>
            <Input
              placeholder={effectiveKeyPlaceholder}
              value={currentCustomValue}
              onChange={(e) => setCurrentCustomValue(e.target.value)}
              className="text-sm"
              data-testid={`input-${prefix}-key-value`}
            />
          </div>
        )}

        {isSelectionBasedOperator && (
          <div className="mb-3">
            <Input
              placeholder={effectiveSearchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
              data-testid={`input-${prefix}-search`}
            />
          </div>
        )}

        {isSelectionBasedOperator && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allVisible}
              className="flex-1"
              data-testid={`button-select-all-${prefix}`}
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={noneVisible}
              className="flex-1"
              data-testid={`button-deselect-all-${prefix}`}
            >
              <Square className="w-3 h-3 mr-1" />
              Deselect All
            </Button>
          </div>
        )}
      </div>

      {isSelectionBasedOperator && (
        <div className="max-h-64 overflow-y-auto bg-[#2F3341]">
          {filteredOptions.map((option) => {
            const isSelected = currentValues.includes(option.id);
            const accentColor = option.color ?? 'bg-slate-500';

            return (
              <div
                key={option.id}
                onClick={() => handleToggleValue(option.id)}
                className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-[#3A3F4F] cursor-pointer bg-[#2F3341]"
                data-testid={`${prefix}-option-${option.id}`}
              >
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-[#2F3341] border-border text-muted-foreground'
                  }`}
                >
                  <div className={`p-1 rounded ${accentColor}`}>
                    <Link2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>

                <div className="ml-auto">
                  {isSelected ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 rounded border border-border" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 border-t border-border bg-[#2F3341] flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isTextBasedOperator
            ? `Operator: ${selectedOperatorObj?.label || 'None'}`
            : `${currentValues.length} of ${options.length} ${pluralLower} selected`}
        </p>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid={`button-reset-${prefix}-filter`}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to default</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1"
            data-testid={`button-apply-${prefix}-filter`}
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
