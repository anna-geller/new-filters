import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, Info, Plus, X } from "lucide-react";
import type { DetailFilter } from "@/types/auditLogs";

interface DetailsFilterEditorProps {
  details: DetailFilter[];
  onChange: (details: DetailFilter[]) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function DetailsFilterEditor({ details, onChange, onClose, onReset }: DetailsFilterEditorProps) {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [pairs, setPairs] = useState<DetailFilter[]>(details);

  useEffect(() => {
    setPairs(details);
  }, [details]);

  const resetInputs = () => {
    setKeyInput("");
    setValueInput("");
  };

  const handleAddPair = () => {
    const key = keyInput.trim();
    const value = valueInput.trim();
    if (!key || !value) {
      return;
    }

    const alreadyExists = pairs.some(pair => pair.key.toLowerCase() === key.toLowerCase() && pair.value.toLowerCase() === value.toLowerCase());
    if (!alreadyExists) {
      setPairs(prev => [...prev, { key, value }]);
    }
    resetInputs();
  };

  const handleRemovePair = (index: number) => {
    setPairs(prev => prev.filter((_, pairIndex) => pairIndex !== index));
  };

  const handleApply = () => {
    const key = keyInput.trim();
    const value = valueInput.trim();
    const alreadyExists = key && value
      ? pairs.some(pair => pair.key.toLowerCase() === key.toLowerCase() && pair.value.toLowerCase() === value.toLowerCase())
      : false;
    const nextPairs = key && value && !alreadyExists ? [...pairs, { key, value }] : [...pairs];

    onChange(nextPairs);
    resetInputs();
    onClose();
  };

  const handleReset = () => {
    onReset?.();
    setPairs([]);
    resetInputs();
  };

  const keyHasValue = keyInput.trim().length > 0;
  const valueHasValue = valueInput.trim().length > 0;
  const hasPendingInput = keyHasValue || valueHasValue;
  const hasCompletePendingPair = keyHasValue && valueHasValue;
  const isApplyDisabled = hasPendingInput && !hasCompletePendingPair;

  return (
    <Card className="w-[26rem] p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border bg-[#2F3341]">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Details</h3>
        </div>
        <div className="space-y-3">
          {pairs.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">Active key/value pairs</span>
              <div className="flex flex-wrap gap-2">
                {pairs.map((pair, index) => {
                  const displayValue = `${pair.key}:${pair.value}`;
                  return (
                    <Badge
                      key={`${pair.key}-${pair.value}-${index}`}
                      variant="outline"
                      className="text-xs bg-transparent border-border/50 text-foreground/80"
                      title={displayValue}
                    >
                      <div className="flex items-center gap-1 max-w-[18rem]">
                        <span className="font-mono whitespace-nowrap truncate">
                          {displayValue}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePair(index)}
                          className="ml-1 text-muted-foreground/80 hover:text-primary transition-colors"
                          aria-label={`Remove ${displayValue}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Detail key</label>
            <Input
              placeholder="e.g. type"
              value={keyInput}
              onChange={event => setKeyInput(event.target.value)}
              data-testid="input-details-key"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Detail value</label>
            <Input
              placeholder="e.g. io.kestra.ee.models..."
              value={valueInput}
              onChange={event => setValueInput(event.target.value)}
              data-testid="input-details-value"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddPair}
            disabled={!(keyInput.trim() && valueInput.trim())}
            className="w-full justify-center"
            data-testid="button-details-add"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add key/value pair
          </Button>
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
              <TooltipContent>Reset details filters</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isApplyDisabled}
            className="min-w-[5rem]"
            data-testid="button-details-apply"
          >
            Apply
          </Button>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-[#2F3341] text-xs text-muted-foreground">
        Add one or more key/value pairs. Entries must match every pair listed.
      </div>
    </Card>
  );
}
