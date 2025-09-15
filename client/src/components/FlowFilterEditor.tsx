import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, CheckCircle, Workflow } from "lucide-react";

const flowOptions = [
  { 
    id: 'myflow', 
    label: 'myflow', 
    description: 'Main application workflow'
  },
  { 
    id: 'security-scan', 
    label: 'security-scan', 
    description: 'Security scanning workflow'
  },
  { 
    id: 'data-pipeline', 
    label: 'data-pipeline', 
    description: 'Data processing pipeline'
  },
  { 
    id: 'user-onboarding', 
    label: 'user-onboarding', 
    description: 'User registration and setup flow'
  },
  { 
    id: 'payment-processing', 
    label: 'payment-processing', 
    description: 'Payment and billing workflow'
  },
  { 
    id: 'notification-service', 
    label: 'notification-service', 
    description: 'Email and push notification flow'
  },
  { 
    id: 'content-moderation', 
    label: 'content-moderation', 
    description: 'Content review and approval workflow'
  },
  { 
    id: 'backup-restore', 
    label: 'backup-restore', 
    description: 'Data backup and recovery flow'
  },
  { 
    id: 'deployment-pipeline', 
    label: 'deployment-pipeline', 
    description: 'Application deployment workflow'
  },
  { 
    id: 'analytics-report', 
    label: 'analytics-report', 
    description: 'Analytics data processing flow'
  },
];

interface FlowFilterEditorProps {
  selectedFlows: string[];
  onSelectionChange: (flows: string[]) => void;
  onClose: () => void;
}

export default function FlowFilterEditor({ 
  selectedFlows, 
  onSelectionChange, 
  onClose 
}: FlowFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFlows = flowOptions.filter(flow =>
    flow.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFlow = (flowId: string) => {
    const isSelected = selectedFlows.includes(flowId);
    if (isSelected) {
      onSelectionChange(selectedFlows.filter(id => id !== flowId));
    } else {
      onSelectionChange([...selectedFlows, flowId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleFlows = filteredFlows.map(flow => flow.id);
    const combinedFlows = [...selectedFlows, ...allVisibleFlows];
    const newSelection = Array.from(new Set(combinedFlows));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleFlowIds = filteredFlows.map(flow => flow.id);
    const newSelection = selectedFlows.filter(id => !visibleFlowIds.includes(id));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredFlows.every(flow => selectedFlows.includes(flow.id));
  const noneVisible = filteredFlows.every(flow => !selectedFlows.includes(flow.id));

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search flows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="flow-search-input"
        />
        
        {/* Select/Deselect buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allVisible}
            className="flex-1"
            data-testid="flow-select-all-button"
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
            data-testid="flow-deselect-all-button"
          >
            <Square className="w-3 h-3 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* Flow list */}
      <div className="max-h-64 overflow-y-auto" data-testid="flow-options-list">
        {filteredFlows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No flows found matching "{searchTerm}"
          </div>
        ) : (
          filteredFlows.map((flow) => {
            const isSelected = selectedFlows.includes(flow.id);
            return (
              <div
                key={flow.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleFlow(flow.id)}
                data-testid={`flow-option-${flow.id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Workflow className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{flow.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{flow.description}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" data-testid={`flow-selected-${flow.id}`} />
                  ) : (
                    <div className="w-4 h-4 border border-input rounded-sm" data-testid={`flow-unselected-${flow.id}`} />
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
            {selectedFlows.length} flow{selectedFlows.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="flow-close-button"
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}