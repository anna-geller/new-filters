import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, CheckCircle, GitBranch } from "lucide-react";

const subflowOptions = [
  { 
    id: 'authentication', 
    label: 'authentication', 
    description: 'User authentication subflow'
  },
  { 
    id: 'authorization', 
    label: 'authorization', 
    description: 'Permission validation subflow'
  },
  { 
    id: 'data-validation', 
    label: 'data-validation', 
    description: 'Input data validation subflow'
  },
  { 
    id: 'notification', 
    label: 'notification', 
    description: 'Notification delivery subflow'
  },
  { 
    id: 'audit-logging', 
    label: 'audit-logging', 
    description: 'Audit trail logging subflow'
  },
  { 
    id: 'error-handling', 
    label: 'error-handling', 
    description: 'Error processing and recovery subflow'
  },
  { 
    id: 'data-transformation', 
    label: 'data-transformation', 
    description: 'Data format transformation subflow'
  },
  { 
    id: 'cache-management', 
    label: 'cache-management', 
    description: 'Cache operations subflow'
  },
  { 
    id: 'file-processing', 
    label: 'file-processing', 
    description: 'File upload and processing subflow'
  },
  { 
    id: 'integration-callback', 
    label: 'integration-callback', 
    description: 'External system callback subflow'
  },
];

interface SubflowFilterEditorProps {
  selectedSubflows: string[];
  onSelectionChange: (subflows: string[]) => void;
  onClose: () => void;
}

export default function SubflowFilterEditor({ 
  selectedSubflows, 
  onSelectionChange, 
  onClose 
}: SubflowFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubflows = subflowOptions.filter(subflow =>
    subflow.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSubflow = (subflowId: string) => {
    const isSelected = selectedSubflows.includes(subflowId);
    if (isSelected) {
      onSelectionChange(selectedSubflows.filter(id => id !== subflowId));
    } else {
      onSelectionChange([...selectedSubflows, subflowId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleSubflows = filteredSubflows.map(subflow => subflow.id);
    const combinedSubflows = [...selectedSubflows, ...allVisibleSubflows];
    const newSelection = Array.from(new Set(combinedSubflows));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleSubflowIds = filteredSubflows.map(subflow => subflow.id);
    const newSelection = selectedSubflows.filter(id => !visibleSubflowIds.includes(id));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredSubflows.every(subflow => selectedSubflows.includes(subflow.id));
  const noneVisible = filteredSubflows.every(subflow => !selectedSubflows.includes(subflow.id));

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search subflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="subflow-search-input"
        />
        
        {/* Select/Deselect buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allVisible}
            className="flex-1"
            data-testid="subflow-select-all-button"
          >
            <CheckSquare className="w-3 h-3 mr-1" />
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={noneVisible}
            className="flex-1"
            data-testid="subflow-deselect-all-button"
          >
            <Square className="w-3 h-3 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* Subflow list */}
      <div className="max-h-64 overflow-y-auto" data-testid="subflow-options-list">
        {filteredSubflows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No subflows found matching "{searchTerm}"
          </div>
        ) : (
          filteredSubflows.map((subflow) => {
            const isSelected = selectedSubflows.includes(subflow.id);
            return (
              <div
                key={subflow.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleSubflow(subflow.id)}
                data-testid={`subflow-option-${subflow.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <GitBranch className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{subflow.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{subflow.description}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" data-testid={`subflow-selected-${subflow.id}`} />
                  ) : (
                    <div className="w-4 h-4 border border-input rounded-sm" data-testid={`subflow-unselected-${subflow.id}`} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedSubflows.length} subflow{selectedSubflows.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="subflow-close-button"
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}