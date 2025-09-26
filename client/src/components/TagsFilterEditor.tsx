import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, CheckCircle, Tag, RotateCcw } from "lucide-react";

export interface TagOption {
  id: string;
  label: string;
}

interface TagsFilterEditorProps {
  selectedTags: string[];
  operator: string;
  customValue: string;
  options: TagOption[];
  onSelectionChange: (tags: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onCustomValueChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

const operatorOptions = [
  { value: 'in', label: 'in' },
  { value: 'not-in', label: 'not in' },
  { value: 'contains', label: 'contains' },
  { value: 'starts-with', label: 'starts with' },
  { value: 'ends-with', label: 'ends with' },
];

export default function TagsFilterEditor({
  selectedTags,
  operator,
  customValue,
  options,
  onSelectionChange,
  onOperatorChange,
  onCustomValueChange,
  onClose,
  onReset,
}: TagsFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTags, setCurrentTags] = useState(selectedTags);
  const [currentOperator, setCurrentOperator] = useState(operator);
  const [currentCustomValue, setCurrentCustomValue] = useState(customValue);

  const isTextOperator = ['contains', 'starts-with', 'ends-with'].includes(currentOperator);

  useEffect(() => {
    setCurrentTags(selectedTags);
  }, [selectedTags]);

  useEffect(() => {
    setCurrentOperator(operator);
  }, [operator]);

  useEffect(() => {
    setCurrentCustomValue(customValue);
  }, [customValue]);

  const filteredTags = options.filter((tag) =>
    tag.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleTag = (tagId: string) => {
    const isSelected = currentTags.includes(tagId);
    if (isSelected) {
      setCurrentTags(currentTags.filter((id) => id !== tagId));
    } else {
      setCurrentTags([...currentTags, tagId]);
    }
  };

  const handleSelectAll = () => {
    const visibleIds = filteredTags.map((tag) => tag.id);
    const next = Array.from(new Set([...currentTags, ...visibleIds]));
    setCurrentTags(next);
  };

  const handleDeselectAll = () => {
    const visibleIds = filteredTags.map((tag) => tag.id);
    const next = currentTags.filter((id) => !visibleIds.includes(id));
    setCurrentTags(next);
  };

  const allVisible = filteredTags.length > 0 && filteredTags.every((tag) => currentTags.includes(tag.id));
  const noneVisible = filteredTags.every((tag) => !currentTags.includes(tag.id));

  const handleApply = () => {
    onSelectionChange(currentTags);
    onOperatorChange(currentOperator);
    onCustomValueChange(currentCustomValue);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentTags(selectedTags);
      setCurrentOperator(operator);
      setCurrentCustomValue(customValue);
    }
  };

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Filter Operator</label>
          <Select value={currentOperator} onValueChange={setCurrentOperator}>
            <SelectTrigger data-testid="select-tags-operator">
              <SelectValue placeholder="Select operator...">
                {operatorOptions.find((option) => option.value === currentOperator)?.label ||
                  'Select operator...'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTextOperator ? (
          <Input
            placeholder="Enter text..."
            value={currentCustomValue}
            onChange={(e) => setCurrentCustomValue(e.target.value)}
            data-testid="input-tags-text"
          />
        ) : (
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-tags-search"
          />
        )}

        {!isTextOperator && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allVisible}
              className="flex-1"
              data-testid="button-select-all-tags"
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
              data-testid="button-deselect-all-tags"
            >
              <Square className="w-3 h-3 mr-1" />
              Deselect All
            </Button>
          </div>
        )}
      </div>

      {!isTextOperator && (
        <div className="max-h-64 overflow-y-auto">
          {filteredTags.map((tag) => {
            const isSelected = currentTags.includes(tag.id);
            return (
              <div
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                data-testid={`tag-option-${tag.id}`}
              >
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{tag.label}</span>
                </div>

                <div className="ml-auto">
                  {isSelected ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 rounded border border-border" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 border-t border-border bg-[#2F3341] flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isTextOperator
            ? 'Enter a tag pattern'
            : `${currentTags.length} of ${options.length} tags selected`}
        </p>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="button-reset-tags-filter"
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
            data-testid="button-apply-tags-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
