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
      className="flex items-center gap-2 text-muted-foreground border border-border hover-elevate"
      data-testid="button-customize-filters"
    >
      <Filter className="h-4 w-4" />
      Customize filters
    </Button>
  );
}