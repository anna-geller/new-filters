import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, CheckCircle, Building2, RotateCcw } from "lucide-react";

const namespaceOptions = [
  'company',
  'company.team',
  'company.team.backend',
  'company.team.frontend',
  'company.team.api',
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
}

const operatorOptions = [
  { value: 'in', label: 'in', description: 'Match any of the selected namespaces' },
  { value: 'not-in', label: 'not in', description: 'Exclude any of the selected namespaces' },
  { value: 'contains', label: 'contains', description: 'Namespace contains the text' },
  { value: 'starts-with', label: 'starts with', description: 'Namespace starts with the text' },
  { value: 'ends-with', label: 'ends with', description: 'Namespace ends with the text' },
];

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
}: NamespaceFilterEditorProps) {
  const options = mode === 'tests' ? testsNamespaceOptions : namespaceOptions;
  const [searchTerm, setSearchTerm] = useState('');

  const [currentNamespaces, setCurrentNamespaces] = useState(selectedNamespaces);
  const [currentOperator, setCurrentOperator] = useState(namespaceOperator);
  const [currentCustomValue, setCurrentCustomValue] = useState(customValue);

  useEffect(() => {
    setCurrentNamespaces(selectedNamespaces);
  }, [selectedNamespaces]);

  useEffect(() => {
    setCurrentOperator(namespaceOperator);
  }, [namespaceOperator]);

  useEffect(() => {
    setCurrentCustomValue(customValue);
  }, [customValue]);

  const isTextBasedOperator = ['contains', 'starts-with', 'ends-with'].includes(currentOperator);

  const filteredNamespaces = options.filter((namespace) =>
    namespace.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleNamespace = (namespace: string) => {
    const isSelected = currentNamespaces.includes(namespace);
    if (isSelected) {
      setCurrentNamespaces(currentNamespaces.filter((ns) => ns !== namespace));
    } else {
      setCurrentNamespaces([...currentNamespaces, namespace]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleNamespaces = [...filteredNamespaces];
    const combinedNamespaces = [...currentNamespaces, ...allVisibleNamespaces];
    const newSelection = Array.from(new Set(combinedNamespaces));
    setCurrentNamespaces(newSelection);
  };

  const handleDeselectAll = () => {
    const newSelection = currentNamespaces.filter(
      (namespace) => !filteredNamespaces.includes(namespace),
    );
    setCurrentNamespaces(newSelection);
  };

  const allVisible = filteredNamespaces.every((namespace) => currentNamespaces.includes(namespace));
  const noneVisible = filteredNamespaces.every((namespace) => !currentNamespaces.includes(namespace));

  const handleApply = () => {
    onSelectionChange(currentNamespaces);
    onOperatorChange(currentOperator);
    onCustomValueChange(currentCustomValue);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentNamespaces(selectedNamespaces);
      setCurrentOperator(namespaceOperator);
      setCurrentCustomValue(customValue);
    }
  };

  const getNamespaceLevel = (namespace: string) => {
    return namespace.split('.').length - 1;
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Filter Operator
          </label>
          <Select value={currentOperator} onValueChange={setCurrentOperator}>
            <SelectTrigger data-testid="select-namespace-operator">
              <SelectValue placeholder="Select operator...">
                {operatorOptions.find((opt) => opt.value === currentOperator)?.label ||
                  'Select operator...'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTextBasedOperator ? (
          <Input
            placeholder="Enter text..."
            value={currentCustomValue}
            onChange={(e) => setCurrentCustomValue(e.target.value)}
            data-testid="input-namespace-text"
          />
        ) : (
          <Input
            placeholder="Search namespaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-namespace-search"
          />
        )}

        {!isTextBasedOperator && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allVisible}
              className="flex-1"
              data-testid="button-select-all-namespaces"
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
              data-testid="button-deselect-all-namespaces"
            >
              <Square className="w-3 h-3 mr-1" />
              Deselect All
            </Button>
          </div>
        )}
      </div>

      {!isTextBasedOperator && (
        <div className="max-h-64 overflow-y-auto">
          {filteredNamespaces.map((namespace) => {
            const isSelected = currentNamespaces.includes(namespace);
            const level = getNamespaceLevel(namespace);

            return (
              <div
                key={namespace}
                onClick={() => handleToggleNamespace(namespace)}
                className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                data-testid={`namespace-option-${namespace.replace(/\./g, '-')}`}
              >
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                  style={{ paddingLeft: `${Math.min(level, 3)}rem` }}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{namespace}</span>
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

      <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isTextBasedOperator
            ? 'Enter a namespace pattern'
            : `${currentNamespaces.length} of ${options.length} namespaces selected`}
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
                  data-testid="button-reset-namespace-filter"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to original value</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1"
            data-testid="button-apply-namespace-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
