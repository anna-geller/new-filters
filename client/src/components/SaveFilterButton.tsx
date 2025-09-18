import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SaveFilterButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SaveFilterButton({ onClick, disabled = false }: SaveFilterButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClick}
          disabled={disabled}
          className="h-7 w-7 p-0 flex items-center justify-center"
          data-testid="save-filter-button"
          aria-label="Save applied filters"
        >
          <Save className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Save applied filters
      </TooltipContent>
    </Tooltip>
  );
}