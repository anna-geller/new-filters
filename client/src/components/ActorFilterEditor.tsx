import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, UserCheck } from "lucide-react";

interface ActorFilterEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
  title?: string;
  placeholder?: string;
}

export default function ActorFilterEditor({ value, onChange, onClose, onReset, title = 'Actor', placeholder = 'Search by email, name, or service account...' }: ActorFilterEditorProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleApply = () => {
    onChange(inputValue.trim());
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setInputValue('');
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border bg-[#2F3341]">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <div className="mb-3">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            data-testid="input-actor"
          />
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="button-actor-reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to default</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={inputValue.trim() === ''}
            className="flex-1"
            data-testid="button-actor-apply"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
