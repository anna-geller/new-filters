import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, CheckCircle, Tag, RotateCcw } from "lucide-react";

const kindOptions = [
  { 
    id: 'default', 
    label: 'Default', 
    description: 'Standard workflow executions'
  },
  { 
    id: 'playground', 
    label: 'Playground', 
    description: 'Executions triggered from Playground mode'
  },
  { 
    id: 'test', 
    label: 'Test', 
    description: 'Executions triggered by Unit Tests'
  },
];

interface KindFilterEditorProps {
  selectedKinds: string[];
  onSelectionChange: (kinds: string[]) => void;
  onClose: () => void;
}

export default function KindFilterEditor({ 
  selectedKinds, 
  onSelectionChange, 
  onClose 
}: KindFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state to track current values vs original props
  const [currentKinds, setCurrentKinds] = useState(selectedKinds);

  const filteredKinds = kindOptions.filter(kind =>
    kind.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kind.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleKind = (kindId: string) => {
    const isSelected = currentKinds.includes(kindId);
    if (isSelected) {
      setCurrentKinds(currentKinds.filter(id => id !== kindId));
    } else {
      setCurrentKinds([...currentKinds, kindId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleKinds = filteredKinds.map(kind => kind.id);
    const combinedKinds = [...currentKinds, ...allVisibleKinds];
    const newSelection = Array.from(new Set(combinedKinds));
    setCurrentKinds(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleKindIds = filteredKinds.map(kind => kind.id);
    const newSelection = currentKinds.filter(id => !visibleKindIds.includes(id));
    setCurrentKinds(newSelection);
  };

  const allVisible = filteredKinds.every(kind => currentKinds.includes(kind.id));
  const noneVisible = filteredKinds.every(kind => !currentKinds.includes(kind.id));
  
  const handleApply = () => {
    onSelectionChange(currentKinds);
    onClose();
  };
  
  const handleReset = () => {
    setCurrentKinds(['default']); // Reset to default value
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-border bg-[#2F3341]">
        <Input
          placeholder="Search kinds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="kind-search-input"
        />
        
        {/* Select/Deselect buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allVisible}
            className="flex-1"
            data-testid="kind-select-all-button"
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
            data-testid="kind-deselect-all-button"
          >
            <Square className="w-3 h-3 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* Kind list */}
      <div className="max-h-64 overflow-y-auto" data-testid="kind-options-list">
        {filteredKinds.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No kinds found matching "{searchTerm}"
          </div>
        ) : (
          filteredKinds.map((kind) => {
            const isSelected = currentKinds.includes(kind.id);
            return (
              <div
                key={kind.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleKind(kind.id)}
                data-testid={`kind-option-${kind.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{kind.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{kind.description}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" data-testid={`kind-selected-${kind.id}`} />
                  ) : (
                    <div className="w-4 h-4 border border-input rounded-sm" data-testid={`kind-unselected-${kind.id}`} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-[#2F3341]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentKinds.length} kind{currentKinds.length !== 1 ? 's' : ''} selected
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
                    data-testid="button-reset-kind-filter"
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
              data-testid="button-apply-kind-filter"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}