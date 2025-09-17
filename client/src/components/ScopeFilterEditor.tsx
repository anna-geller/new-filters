import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, CheckCircle, Target, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const scopeOptions = [
  { 
    id: 'user', 
    label: 'User Executions', 
    description: 'Executions initiated by regular users'
  },
  { 
    id: 'system', 
    label: 'System Executions', 
    description: 'Maintenance executions'
  },
];

interface ScopeFilterEditorProps {
  selectedScopes: string[];
  onSelectionChange: (scopes: string[]) => void;
  onClose: () => void;
}

export default function ScopeFilterEditor({ 
  selectedScopes, 
  onSelectionChange, 
  onClose 
}: ScopeFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Store original values for reset functionality
  const originalValues = useRef({
    selectedScopes: selectedScopes
  });

  const filteredScopes = scopeOptions.filter(scope =>
    scope.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scope.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleScope = (scopeId: string) => {
    const isSelected = selectedScopes.includes(scopeId);
    if (isSelected) {
      onSelectionChange(selectedScopes.filter(id => id !== scopeId));
    } else {
      onSelectionChange([...selectedScopes, scopeId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleScopes = filteredScopes.map(scope => scope.id);
    const combinedScopes = [...selectedScopes, ...allVisibleScopes];
    const newSelection = Array.from(new Set(combinedScopes));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleScopeIds = filteredScopes.map(scope => scope.id);
    const newSelection = selectedScopes.filter(id => !visibleScopeIds.includes(id));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredScopes.every(scope => selectedScopes.includes(scope.id));
  const noneVisible = filteredScopes.every(scope => !selectedScopes.includes(scope.id));

  const handleReset = () => {
    onSelectionChange(originalValues.current.selectedScopes);
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Scope Filter</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="scope-reset-button"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to original value</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          placeholder="Search scopes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="scope-search-input"
        />
        
        {/* Select/Deselect buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allVisible}
            className="flex-1"
            data-testid="scope-select-all-button"
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
            data-testid="scope-deselect-all-button"
          >
            <Square className="w-3 h-3 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* Scope list */}
      <div className="max-h-64 overflow-y-auto" data-testid="scope-options-list">
        {filteredScopes.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No scopes found matching "{searchTerm}"
          </div>
        ) : (
          filteredScopes.map((scope) => {
            const isSelected = selectedScopes.includes(scope.id);
            return (
              <div
                key={scope.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleScope(scope.id)}
                data-testid={`scope-option-${scope.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Target className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{scope.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{scope.description}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" data-testid={`scope-selected-${scope.id}`} />
                  ) : (
                    <div className="w-4 h-4 border border-input rounded-sm" data-testid={`scope-unselected-${scope.id}`} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedScopes.length} scope{selectedScopes.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="scope-close-button"
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}