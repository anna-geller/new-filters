import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayCircle, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParentFilterEditorProps {
  selectedInitialExecution: string;
  onSelectionChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function ParentFilterEditor({ 
  selectedInitialExecution, 
  onSelectionChange, 
  onClose,
  onReset 
}: ParentFilterEditorProps) {
  const [inputValue, setInputValue] = useState(selectedInitialExecution || '');

  const handleApply = () => {
    onSelectionChange(inputValue.trim());
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset(); // Call the parent's reset function for proper integration
    } else {
      setInputValue(''); // Fallback to local reset
    }
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Parent</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Enter parent ID..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            data-testid="parent-execution-id-input"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={inputValue === ''}
                  className="px-2"
                  data-testid="parent-execution-reset-button"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to default</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleApply}
            disabled={false}
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