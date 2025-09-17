import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface InitialExecutionFilterEditorProps {
  selectedInitialExecution: string;
  onSelectionChange: (value: string) => void;
  onClose: () => void;
}

export default function InitialExecutionFilterEditor({ 
  selectedInitialExecution, 
  onSelectionChange, 
  onClose 
}: InitialExecutionFilterEditorProps) {
  const [inputValue, setInputValue] = useState(selectedInitialExecution || '');

  const handleApply = () => {
    onSelectionChange(inputValue.trim());
    onClose();
  };

  const handleClear = () => {
    setInputValue('');
    onSelectionChange('');
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Parent</h3>
        </div>
        
        <Input
          placeholder="Enter parent execution ID..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="mb-3"
          data-testid="parent-execution-id-input"
        />
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!inputValue}
            className="flex-1"
            data-testid="parent-execution-clear-button"
          >
            Clear
          </Button>
          
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!inputValue.trim()}
            className="flex-1"
            data-testid="parent-execution-apply-button"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground">
          Enter the ID of a parent execution to filter results to only executions started from that parent.
        </div>
      </div>
    </Card>
  );
}