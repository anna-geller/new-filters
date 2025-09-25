import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, Info } from "lucide-react";

interface DetailsFilterEditorProps {
  detailKey: string;
  detailValue: string;
  onChange: (detailKey: string, detailValue: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function DetailsFilterEditor({ detailKey, detailValue, onChange, onClose, onReset }: DetailsFilterEditorProps) {
  const [keyInput, setKeyInput] = useState(detailKey);
  const [valueInput, setValueInput] = useState(detailValue);

  useEffect(() => {
    setKeyInput(detailKey);
  }, [detailKey]);

  useEffect(() => {
    setValueInput(detailValue);
  }, [detailValue]);

  const handleApply = () => {
    onChange(keyInput.trim(), valueInput.trim());
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setKeyInput('');
    setValueInput('');
  };

  const isApplyDisabled = keyInput.trim() === '' || valueInput.trim() === '';

  return (
    <Card className="w-[26rem] p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Details</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Detail key</label>
            <Input
              placeholder="e.g. type"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              data-testid="input-details-key"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Detail value</label>
            <Input
              placeholder="e.g. io.kestra.ee.models..."
              value={valueInput}
              onChange={(event) => setValueInput(event.target.value)}
              data-testid="input-details-value"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="button-details-reset"
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
            disabled={isApplyDisabled}
            className="flex-1 ml-2"
            data-testid="button-details-apply"
          >
            Apply
          </Button>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        Provide a key/value pair to match entries in the details payload.
      </div>
    </Card>
  );
}
