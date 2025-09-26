import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  operator?: string;
}

interface FilterCustomizationPanelProps {
  isOpen: boolean;
  filterOptions: FilterOption[];
  activeFilters: ActiveFilter[];
  onAddFilter: (filterId: string) => void;
  onClose: () => void;
}

export default function FilterCustomizationPanel({ 
  isOpen, 
  filterOptions, 
  activeFilters,
  onAddFilter,
  onClose 
}: FilterCustomizationPanelProps) {

  if (!isOpen) return null;

  const isFilterActive = (filterId: string) => {
    return activeFilters.some(filter => filter.id === filterId);
  };

  const handleAddFilter = (filterId: string) => {
    if (!isFilterActive(filterId)) {
      onAddFilter(filterId);
    }
  };

  return (
    <Card className="absolute top-full left-0 mt-2 w-80 p-0 bg-popover border border-popover-border shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-medium text-foreground">Add Filters</h3>
          <p className="text-xs text-muted-foreground mt-1">Select filters to add</p>
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
        {[...filterOptions]
          .sort((a, b) => a.order - b.order)
          .map((option) => {
            const isActive = isFilterActive(option.id);
            return (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 border-b border-border/50 ${
                  isActive 
                    ? 'opacity-50 cursor-not-allowed bg-muted/20' 
                    : 'hover:bg-muted/30 cursor-pointer'
                }`}
                onClick={() => handleAddFilter(option.id)}
                data-testid={`filter-item-${option.id}`}
              >
                {/* Filter Info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-muted-foreground' : 'text-foreground'
                  }`}>{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>

                {/* Add Button */}
                {!isActive && (
                  <button
                    className="p-1 rounded hover-elevate text-green-500 hover:text-green-600"
                    data-testid={`add-filter-${option.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border bg-[#2F3341]">
        <p className="text-xs text-muted-foreground text-center">
          {activeFilters.length} of {filterOptions.length} filters added
        </p>
      </div>
    </Card>
  );
}