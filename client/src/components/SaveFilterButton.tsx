import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveFilterButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SaveFilterButton({ onClick, disabled = false }: SaveFilterButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2"
      data-testid="save-filter-button"
    >
      <Save className="w-4 h-4" />
      Save Filter
    </Button>
  );
}