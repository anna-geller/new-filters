import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";

const operatorOptions = [
  { id: "equals", label: "equals", description: "Trigger ID matches the exact value" },
  { id: "not-equals", label: "not equals", description: "Trigger ID does not match the value" },
  { id: "contains", label: "contains", description: "Trigger ID contains the text" },
  { id: "starts-with", label: "starts with", description: "Trigger ID starts with the text" },
  { id: "ends-with", label: "ends with", description: "Trigger ID ends with the text" },
];

interface TriggerIdFilterEditorProps {
  value: string;
  operator: string;
  onValueChange: (value: string) => void;
  onOperatorChange: (operator: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

export default function TriggerIdFilterEditor({
  value,
  operator,
  onValueChange,
  onOperatorChange,
  onClose,
  onReset,
}: TriggerIdFilterEditorProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [currentOperator, setCurrentOperator] = useState(operator);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    setCurrentOperator(operator);
  }, [operator]);

  const handleApply = () => {
    onOperatorChange(currentOperator);
    onValueChange(currentValue);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentValue("");
      setCurrentOperator("equals");
    }
  };

  const selectedOperator = operatorOptions.find((option) => option.id === currentOperator);

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border space-y-3 bg-[#2F3341]">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Filter Operator
          </label>
          <Select value={currentOperator} onValueChange={setCurrentOperator}>
            <SelectTrigger data-testid="select-trigger-id-operator">
              <SelectValue placeholder="Select operator">
                {selectedOperator?.label ?? "Select operator"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Trigger ID
          </label>
          <Input
            value={currentValue}
            onChange={(event) => setCurrentValue(event.target.value)}
            placeholder="Enter trigger identifier"
            data-testid="input-trigger-id-value"
          />
        </div>
      </div>

      <div className="p-4 border-t border-border bg-[#2F3341]">
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="button-reset-trigger-id-filter"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to default</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button size="sm" onClick={handleApply} className="flex-1" data-testid="button-apply-trigger-id-filter">
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
