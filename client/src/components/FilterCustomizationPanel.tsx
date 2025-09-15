import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronUp } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
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
  if (!isOpen) return null;

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-popover border border-popover-border shadow-lg z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Available Filters</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-close-customization"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {filterOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                {option.label}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </div>
            <Switch
              id={option.id}
              checked={option.enabled}
              onCheckedChange={() => onToggleFilter(option.id)}
              data-testid={`switch-filter-${option.id}`}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {filterOptions.filter(f => f.enabled).length} of {filterOptions.length} filters visible
        </p>
      </div>
    </Card>
  );
}