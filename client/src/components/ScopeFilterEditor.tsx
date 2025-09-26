import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, CheckCircle, Target, RotateCcw } from "lucide-react";

export interface ScopeOption {
  id: string;
  label: string;
  description: string;
}

const defaultScopeOptions: ScopeOption[] = [
  {
    id: 'user',
    label: 'User Executions',
    description: 'Executions initiated by regular users',
  },
  {
    id: 'system',
    label: 'System Executions',
    description: 'Maintenance executions',
  },
];

interface ScopeFilterEditorProps {
  selectedScopes: string[];
  onSelectionChange: (scopes: string[]) => void;
  onClose: () => void;
  onReset?: () => void;
  options?: ScopeOption[];
}

export default function ScopeFilterEditor({
  selectedScopes,
  onSelectionChange,
  onClose,
  onReset,
  options,
}: ScopeFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const availableScopes = options ?? defaultScopeOptions;
  const [currentScopes, setCurrentScopes] = useState(selectedScopes);

  const filteredScopes = availableScopes.filter(
    (scope) =>
      scope.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleScope = (scopeId: string) => {
    const isSelected = currentScopes.includes(scopeId);
    if (isSelected) {
      setCurrentScopes(currentScopes.filter((id) => id !== scopeId));
    } else {
      setCurrentScopes([...currentScopes, scopeId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleScopes = filteredScopes.map((scope) => scope.id);
    const combinedScopes = [...currentScopes, ...allVisibleScopes];
    const newSelection = Array.from(new Set(combinedScopes));
    setCurrentScopes(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleScopeIds = filteredScopes.map((scope) => scope.id);
    const newSelection = currentScopes.filter((id) => !visibleScopeIds.includes(id));
    setCurrentScopes(newSelection);
  };

  const allVisible = filteredScopes.every((scope) => currentScopes.includes(scope.id));
  const noneVisible = filteredScopes.every((scope) => !currentScopes.includes(scope.id));

  const handleApply = () => {
    onSelectionChange(currentScopes);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentScopes(['user']);
    }
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border bg-[#2F3341]">
        <Input
          placeholder="Search scopes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3 bg-[#14181E]"
          data-testid="scope-search-input"
        />

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
      <div className="max-h-64 overflow-y-auto" data-testid="scope-options-list">
        {filteredScopes.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No scopes found matching "{searchTerm}"
          </div>
        ) : (
          filteredScopes.map((scope) => {
            const isSelected = currentScopes.includes(scope.id);
            return (
              <div
                key={scope.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer bg-[#2F3341]"
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
      <div className="p-4 border-t border-border bg-[#2F3341]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentScopes.length} scope{currentScopes.length !== 1 ? 's' : ''} selected
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
                    data-testid="button-reset-scope-filter"
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
              data-testid="button-apply-scope-filter"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
