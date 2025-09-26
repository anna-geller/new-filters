import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit2 } from "lucide-react";

interface FilterBadgeProps {
  label: string;
  value: string;
  operator?: string; // e.g., "in", "not in", "starts with"
  onClear: () => void;
  onEdit: () => void;
}

export default function FilterBadge({ label, value, operator = "in", onClear, onEdit }: FilterBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className="flex items-center gap-2 px-3 py-1 text-primary-foreground hover-elevate"
      style={{
        background: 'var(--ks-button-background-secondary, #2F3342)',
        border: '1px solid var(--ks-border-primary, #2F3342)'
      }}
      data-testid={`badge-filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <button
        onClick={onEdit}
        className="flex items-center gap-1 hover:opacity-80"
        data-testid={`button-edit-filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-green-500">{operator}</span>
        <span className="text-xs text-white">{value}</span>
        <Edit2 className="h-3 w-3 opacity-70" />
      </button>
      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="h-4 w-4 p-0 hover:bg-destructive/20"
        data-testid={`button-clear-filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}