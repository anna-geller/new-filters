import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, Check } from "lucide-react";

const hierarchyOptions = [
  { 
    id: 'all', 
    label: 'All', 
    description: 'Show both parent and child executions'
  },
  { 
    id: 'parent', 
    label: 'Parent', 
    description: 'Show only top-level/root executions'
  },
  { 
    id: 'child', 
    label: 'Child', 
    description: 'Show only nested/triggered executions'
  },
];

interface SubflowFilterEditorProps {
  selectedSubflow: string;
  onSelectionChange: (subflow: string) => void;
  onClose: () => void;
}

export default function SubflowFilterEditor({ 
  selectedSubflow, 
  onSelectionChange, 
  onClose 
}: SubflowFilterEditorProps) {

  const handleSelectHierarchy = (hierarchyId: string) => {
    onSelectionChange(hierarchyId);
  };

  return (
    <Card className="w-80 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="font-medium text-sm mb-1">Select hierarchy level</div>
        <div className="text-xs text-muted-foreground">Choose which executions to include</div>
      </div>

      {/* Hierarchy options - radio button style */}
      <div data-testid="hierarchy-options-list">
        {hierarchyOptions.map((hierarchy) => {
          const isSelected = selectedSubflow === hierarchy.id;
          return (
            <div
              key={hierarchy.id}
              className="flex items-center gap-3 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleSelectHierarchy(hierarchy.id)}
              data-testid={`hierarchy-option-${hierarchy.id}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <GitBranch className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{hierarchy.label}</div>
                  <div className="text-xs text-muted-foreground">{hierarchy.description}</div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-input bg-background'
                }`}>
                  {isSelected && (
                    <Check className="w-2.5 h-2.5 text-white" data-testid={`hierarchy-selected-${hierarchy.id}`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedSubflow ? hierarchyOptions.find(h => h.id === selectedSubflow)?.label || 'None' : 'None'} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="hierarchy-close-button"
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}