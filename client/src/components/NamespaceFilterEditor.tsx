import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, CheckCircle, Building2 } from "lucide-react";

const namespaceOptions = [
  { 
    id: 'company', 
    label: 'company', 
    description: 'Root company namespace'
  },
  { 
    id: 'company.team', 
    label: 'company.team', 
    description: 'Team-level namespace'
  },
  { 
    id: 'company.team.backend', 
    label: 'company.team.backend', 
    description: 'Backend team services'
  },
  { 
    id: 'company.team.frontend', 
    label: 'company.team.frontend', 
    description: 'Frontend team services'
  },
  { 
    id: 'company.team.api', 
    label: 'company.team.api', 
    description: 'API team services'
  },
  { 
    id: 'company.team.database', 
    label: 'company.team.database', 
    description: 'Database team services'
  },
  { 
    id: 'company.analytics', 
    label: 'company.analytics', 
    description: 'Analytics and data processing'
  },
  { 
    id: 'company.security', 
    label: 'company.security', 
    description: 'Security and compliance services'
  },
  { 
    id: 'company.infrastructure', 
    label: 'company.infrastructure', 
    description: 'Infrastructure and platform services'
  },
  { 
    id: 'company.monitoring', 
    label: 'company.monitoring', 
    description: 'Monitoring and observability'
  },
  { 
    id: 'company.ci-cd', 
    label: 'company.ci-cd', 
    description: 'Continuous integration and deployment'
  },
  { 
    id: 'company.external', 
    label: 'company.external', 
    description: 'External service integrations'
  },
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
    namespace.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    namespace.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleNamespace = (namespaceId: string) => {
    const isSelected = selectedNamespaces.includes(namespaceId);
    if (isSelected) {
      onSelectionChange(selectedNamespaces.filter(id => id !== namespaceId));
    } else {
      onSelectionChange([...selectedNamespaces, namespaceId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleNamespaces = filteredNamespaces.map(namespace => namespace.id);
    const combinedNamespaces = [...selectedNamespaces, ...allVisibleNamespaces];
    const newSelection = Array.from(new Set(combinedNamespaces));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleNamespaceIds = filteredNamespaces.map(namespace => namespace.id);
    const newSelection = selectedNamespaces.filter(id => !visibleNamespaceIds.includes(id));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredNamespaces.every(namespace => selectedNamespaces.includes(namespace.id));
  const noneVisible = filteredNamespaces.every(namespace => !selectedNamespaces.includes(namespace.id));

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
          const isSelected = selectedNamespaces.includes(namespace.id);
          const level = getNamespaceLevel(namespace.label);
          
          return (
            <div
              key={namespace.id}
              onClick={() => handleToggleNamespace(namespace.id)}
              className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
              data-testid={`namespace-option-${namespace.id.replace(/\./g, '-')}`}
            >
              {/* Namespace Badge with hierarchical indentation */}
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                    isSelected 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                  style={{ marginLeft: `${level * 12}px` }}
                >
                  <Building2 className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{namespace.label}</span>
                    <span className="text-xs text-muted-foreground/70">{namespace.description}</span>
                  </div>
                </div>
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