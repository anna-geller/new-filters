import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  onSelectionChange: (namespaces: string[]) => void;
  onClose: () => void;
}

export default function NamespaceFilterEditor({ 
  selectedNamespaces, 
  onSelectionChange, 
  onClose 
}: NamespaceFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

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
      {/* Header with search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search namespaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="input-namespace-search"
        />
        
        {/* Select All / Deselect All */}
        <div className="flex items-center gap-4">
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
      </div>

      {/* Namespace Options */}
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

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selectedNamespaces.length} of {namespaceOptions.length} namespaces selected
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