import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GripVertical, X } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  order?: number;
}

interface FilterCustomizationPanelProps {
  isOpen: boolean;
  filterOptions: FilterOption[];
  onToggleFilter: (filterId: string) => void;
  onClose: () => void;
}

export default function FilterCustomizationPanel({ 
  isOpen, 
  filterOptions, 
  onToggleFilter, 
  onClose 
}: FilterCustomizationPanelProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, filterId: string) => {
    setDraggedItem(filterId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetFilterId: string) => {
    e.preventDefault();
    setDraggedItem(null);
    // TODO: Implement reordering logic if needed
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <Card className="absolute top-full left-0 mt-2 w-80 p-0 bg-popover border border-popover-border shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-medium text-foreground">Customize Filters</h3>
          <p className="text-xs text-muted-foreground mt-1">Drag to reorder</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-close-customization"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter List */}
      <div className="max-h-72 overflow-y-auto">
        {filterOptions.map((option) => (
          <div
            key={option.id}
            draggable
            onDragStart={(e) => handleDragStart(e, option.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, option.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-move ${
              draggedItem === option.id ? 'opacity-50' : ''
            }`}
            data-testid={`filter-item-${option.id}`}
          >
            {/* Drag Handle */}
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            {/* Filter Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>

            {/* Visibility Toggle */}
            <button
              onClick={() => onToggleFilter(option.id)}
              className={`p-1 rounded hover-elevate ${
                option.enabled 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-muted-foreground'
              }`}
              data-testid={`toggle-filter-${option.id}`}
            >
              {option.enabled ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          {filterOptions.filter(f => f.enabled).length} of {filterOptions.length} filters visible
        </p>
      </div>
    </Card>
  );
}