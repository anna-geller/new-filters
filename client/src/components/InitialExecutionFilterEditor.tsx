import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, CheckCircle, PlayCircle } from "lucide-react";

const initialExecutionOptions = [
  { 
    id: 'true', 
    label: 'Initial execution', 
    value: true,
    description: 'First-time execution of the workflow'
  },
  { 
    id: 'false', 
    label: 'Re-execution', 
    value: false,
    description: 'Subsequent or retry execution'
  },
];

interface InitialExecutionFilterEditorProps {
  selectedInitialExecution: boolean | null;
  onSelectionChange: (value: boolean | null) => void;
  onClose: () => void;
}

export default function InitialExecutionFilterEditor({ 
  selectedInitialExecution, 
  onSelectionChange, 
  onClose 
}: InitialExecutionFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = initialExecutionOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (value: boolean) => {
    if (selectedInitialExecution === value) {
      // Deselect if already selected
      onSelectionChange(null);
    } else {
      // Select the new value
      onSelectionChange(value);
    }
  };

  const handleClear = () => {
    onSelectionChange(null);
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search execution types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="initial-execution-search-input"
        />
        
        {/* Clear button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={selectedInitialExecution === null}
            className="flex-1"
            data-testid="initial-execution-clear-button"
          >
            <Square className="w-3 h-3 mr-1" />
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Option list */}
      <div className="max-h-64 overflow-y-auto" data-testid="initial-execution-options-list">
        {filteredOptions.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No execution types found matching "{searchTerm}"
          </div>
        ) : (
          filteredOptions.map((option) => {
            const isSelected = selectedInitialExecution === option.value;
            return (
              <div
                key={option.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleOption(option.value)}
                data-testid={`initial-execution-option-${option.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <PlayCircle className={`w-4 h-4 flex-shrink-0 ${option.value ? 'text-green-500' : 'text-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{option.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{option.description}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" data-testid={`initial-execution-selected-${option.id}`} />
                  ) : (
                    <div className="w-4 h-4 border border-input rounded-sm" data-testid={`initial-execution-unselected-${option.id}`} />
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
            {selectedInitialExecution !== null ? '1 option selected' : 'No selection'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="initial-execution-close-button"
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}