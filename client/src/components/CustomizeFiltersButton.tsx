import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface CustomizeFiltersButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function CustomizeFiltersButton({ onClick, isOpen }: CustomizeFiltersButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 text-muted-foreground hover-elevate"
      style={{
        background: 'var(--ks-button-background-secondary, #2F3342)',
        border: '1px solid var(--ks-border-primary, #404559)'
      }}
      data-testid="button-customize-filters"
    >
      <Filter className="h-4 w-4" />
      Add filters
    </Button>
  );
}