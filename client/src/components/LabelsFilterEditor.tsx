import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Square, CheckCircle, Link2 } from "lucide-react";

const operatorOptions = [
  { id: 'has-any-of', label: 'has any of', description: 'Matches at least one of the selected labels (OR)' },
  { id: 'has-none-of', label: 'has none of', description: 'Matches none of the selected labels (NOT OR)' },
  { id: 'has-all-of', label: 'has all of', description: 'Matches all of the selected labels (AND)' },
  { id: 'contains', label: 'contains', description: 'Label contains the specified text (LIKE)' },
  { id: 'does-not-contain', label: 'does not contain', description: 'Label does not contain the specified text (NOT LIKE)' },
  { id: 'is-set', label: 'is set', description: 'Has any labels (regardless of value) (EXISTS)' },
  { id: 'is-not-set', label: 'is not set', description: 'Has no labels at all (NOT EXISTS)' },
];

const labelOptions = [
  { 
    id: 'env:production', 
    label: 'env:production', 
    color: 'bg-blue-500',
    description: 'Production environment'
  },
  { 
    id: 'team:backend', 
    label: 'team:backend', 
    color: 'bg-green-500',
    description: 'Backend team assignments'
  },
  { 
    id: 'team:frontend', 
    label: 'team:frontend', 
    color: 'bg-purple-500',
    description: 'Frontend team assignments'
  },
  { 
    id: 'team:analytics', 
    label: 'team:analytics', 
    color: 'bg-orange-500',
    description: 'Analytics team assignments'
  },
  { 
    id: 'action:cvescan', 
    label: 'action:cvescan', 
    color: 'bg-red-500',
    description: 'Security scanning processes'
  },
  { 
    id: 'team:security', 
    label: 'team:security', 
    color: 'bg-yellow-500',
    description: 'Security team assignments'
  },
  { 
    id: 'action:test', 
    label: 'action:test', 
    color: 'bg-cyan-500',
    description: 'Automated testing processes'
  },
  { 
    id: 'priority:critical', 
    label: 'priority:critical', 
    color: 'bg-pink-500',
    description: 'Critical path executions'
  },
  { 
    id: 'type:user-facing', 
    label: 'type:user-facing', 
    color: 'bg-indigo-500',
    description: 'User-facing features'
  },
  { 
    id: 'type:internal', 
    label: 'type:internal', 
    color: 'bg-teal-500',
    description: 'Internal tooling processes'
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
}

export default function LabelsFilterEditor({ 
  selectedLabels, 
  selectedOperator,
  customValue = '',
  onSelectionChange, 
  onOperatorChange,
  onCustomValueChange,
  onClose 
}: LabelsFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLabels = labelOptions.filter(label =>
    label.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleLabel = (labelId: string) => {
    const isSelected = selectedLabels.includes(labelId);
    if (isSelected) {
      onSelectionChange(selectedLabels.filter(id => id !== labelId));
    } else {
      onSelectionChange([...selectedLabels, labelId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleLabels = filteredLabels.map(label => label.id);
    const combinedLabels = [...selectedLabels, ...allVisibleLabels];
    const newSelection = Array.from(new Set(combinedLabels));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleLabelIds = filteredLabels.map(label => label.id);
    const newSelection = selectedLabels.filter(id => !visibleLabelIds.includes(id));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredLabels.every(label => selectedLabels.includes(label.id));
  const noneVisible = filteredLabels.every(label => !selectedLabels.includes(label.id));
  
  const selectedOperatorObj = operatorOptions.find(op => op.id === selectedOperator);
  const isTextBasedOperator = ['contains', 'does-not-contain'].includes(selectedOperator);
  const isNoInputOperator = ['is-set', 'is-not-set'].includes(selectedOperator);
  const isSelectionBasedOperator = ['has-any-of', 'has-none-of', 'has-all-of'].includes(selectedOperator);

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with operator and search */}
      <div className="p-4 border-b border-border">
        {/* Operator Selection */}
        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Filter Operator
          </label>
          <Select value={selectedOperator} onValueChange={onOperatorChange}>
            <SelectTrigger data-testid="select-labels-operator">
              <SelectValue placeholder="Select operator...">
                {selectedOperatorObj?.label || "Select operator..."}
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

        {/* Custom Value Input for text-based operators */}
        {isTextBasedOperator && (
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Value
            </label>
            <Input
              placeholder={`Enter text that labels should ${selectedOperatorObj?.label || 'match'}...`}
              value={customValue}
              onChange={(e) => onCustomValueChange(e.target.value)}
              className="text-sm"
              data-testid="input-labels-custom-value"
            />
          </div>
        )}

        {/* Search for selection-based operators */}
        {isSelectionBasedOperator && (
          <div className="mb-3">
            <Input
              placeholder="Search labels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
              data-testid="input-labels-search"
            />
          </div>
        )}
        
        {/* Information display for no-input operators */}
        {isNoInputOperator && (
          <div className="mb-3 p-3 bg-muted/30 rounded-md border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-foreground">
                {selectedOperatorObj?.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedOperatorObj?.description}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              No additional configuration needed for this operator.
            </p>
          </div>
        )}

        {/* Select All / Deselect All for selection-based operators */}
        {isSelectionBasedOperator && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              disabled={allVisible}
              className={`flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md ${
                allVisible 
                  ? 'text-blue-400 cursor-not-allowed' 
                  : 'text-blue-500 hover:text-blue-400'
              }`}
              data-testid="button-select-all-labels"
            >
              <CheckSquare className="h-4 w-4" />
              Select All
            </button>
            
            <button
              onClick={handleDeselectAll}
              disabled={noneVisible}
              className={`flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md ${
                noneVisible 
                  ? 'text-muted-foreground cursor-not-allowed' 
                  : 'text-foreground hover:text-muted-foreground'
              }`}
              data-testid="button-deselect-all-labels"
            >
              <Square className="h-4 w-4" />
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Label Options for selection-based operators */}
      {isSelectionBasedOperator && (
        <div className="max-h-64 overflow-y-auto">
          {filteredLabels.map((label) => {
            const isSelected = selectedLabels.includes(label.id);
            
            return (
              <div
                key={label.id}
                onClick={() => handleToggleLabel(label.id)}
                className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                data-testid={`label-option-${label.id}`}
              >
                {/* Label Badge with colored chain-link icon */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  <div className={`p-1 rounded ${label.color}`}>
                    <Link2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{label.label}</span>
                </div>
                
                {/* Checkmark */}
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

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isTextBasedOperator 
            ? `Operator: ${selectedOperatorObj?.label || 'None'}`
            : isNoInputOperator
            ? `Operator: ${selectedOperatorObj?.label || 'None'}`
            : `${selectedLabels.length} of ${labelOptions.length} labels selected`
          }
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-cancel-labels-filter"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            data-testid="button-apply-labels-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}