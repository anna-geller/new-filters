import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ResetFiltersButtonProps {
  onClick: () => void;
}

export default function ResetFiltersButton({ onClick }: ResetFiltersButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground border border-border hover-elevate"
            data-testid="button-reset-filters"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset all filters</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}