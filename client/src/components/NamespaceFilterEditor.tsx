import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Square, CheckCircle, Building2 } from "lucide-react";

const namespaceOptions = [
  'company',
  'company.team',
  'company.team.backend',
  'company.team.frontend', 
  'company.team.api'
];

interface NamespaceFilterEditorProps {
  selectedNamespaces: string[];
  namespaceOperator: string;
  customValue: string;
  onSelectionChange: (namespaces: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
}

const operatorOptions = [
  { value: 'in', label: 'is any of', description: 'Match any of the selected namespaces' },
  { value: 'not-in', label: 'is not any of', description: 'Exclude any of the selected namespaces' },
  { value: 'contains', label: 'contains', description: 'Namespace contains the text' },
  { value: 'starts-with', label: 'starts with', description: 'Namespace starts with the text' },
  { value: 'ends-with', label: 'ends with', description: 'Namespace ends with the text' }
];

export default function NamespaceFilterEditor({ 
  selectedNamespaces, 
  namespaceOperator,
  customValue,
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose 
}: NamespaceFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Check if current operator uses text input instead of multi-select
  const isTextBasedOperator = ['contains', 'starts-with', 'ends-with'].includes(namespaceOperator);

  const filteredNamespaces = namespaceOptions.filter(namespace =>
    namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleNamespace = (namespace: string) => {
    const isSelected = selectedNamespaces.includes(namespace);
    if (isSelected) {
      onSelectionChange(selectedNamespaces.filter(ns => ns !== namespace));
    } else {
      onSelectionChange([...selectedNamespaces, namespace]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleNamespaces = [...filteredNamespaces];
    const combinedNamespaces = [...selectedNamespaces, ...allVisibleNamespaces];
    const newSelection = Array.from(new Set(combinedNamespaces));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const newSelection = selectedNamespaces.filter(namespace => !filteredNamespaces.includes(namespace));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredNamespaces.every(namespace => selectedNamespaces.includes(namespace));
  const noneVisible = filteredNamespaces.every(namespace => !selectedNamespaces.includes(namespace));

  // Helper function to get namespace depth level for visual indentation
  const getNamespaceLevel = (namespace: string) => {
    return namespace.split('.').length - 1;
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with operator selection */}
      <div className="p-4 border-b border-border">
        <div className="mb-3">
          <label className="text-sm font-medium mb-2 block">Filter Mode</label>
          <Select value={namespaceOperator} onValueChange={onOperatorChange}>
            <SelectTrigger data-testid="select-namespace-operator">
              <SelectValue />
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
            value={customValue}
            onChange={(e) => onCustomValueChange(e.target.value)}
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
        
        {/* Select All / Deselect All - only for multi-select operators */}
        {!isTextBasedOperator && (
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleSelectAll}
              disabled={allVisible}
              className={`flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md ${
                allVisible 
                  ? 'text-blue-400 cursor-not-allowed' 
                  : 'text-blue-500 hover:text-blue-400'
              }`}
              data-testid="button-select-all-namespaces"
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
              data-testid="button-deselect-all-namespaces"
            >
              <Square className="h-4 w-4" />
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Namespace Options - only for multi-select operators */}
      {!isTextBasedOperator && (
        <div className="max-h-64 overflow-y-auto">
          {filteredNamespaces.map((namespace) => {
            const isSelected = selectedNamespaces.includes(namespace);
            
            return (
              <div
                key={namespace}
                onClick={() => handleToggleNamespace(namespace)}
                className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                data-testid={`namespace-option-${namespace.replace(/\./g, '-')}`}
              >
                {/* Simple namespace name with checkmark */}
                <span className="text-sm flex-1">{namespace}</span>
                
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
            ? customValue.trim() 
              ? `Text: "${customValue}"` 
              : "Enter text to filter"
            : `${selectedNamespaces.length} of ${namespaceOptions.length} namespaces selected`
          }
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-cancel-namespace-filter"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            data-testid="button-apply-namespace-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}