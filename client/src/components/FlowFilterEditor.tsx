import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, CheckCircle, Workflow, RotateCcw } from "lucide-react";

export interface FlowOption {
  id: string;
  label: string;
  description: string;
}

const defaultFlowOptions: FlowOption[] = [
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
    id: 'data-processing-pipeline', 
    label: 'data-processing-pipeline', 
    description: 'Data processing automated test flow'
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
  { 
    id: 'microservices-and-apis', 
    label: 'microservices-and-apis', 
    description: 'Microservices integration test flow'
  },
  { 
    id: 'email-notifications', 
    label: 'email-notifications', 
    description: 'Email notification system test'
  },
  { 
    id: 'payment-gateway', 
    label: 'payment-gateway', 
    description: 'Payment gateway verification flow'
  },
  { 
    id: 'user-auth-flow', 
    label: 'user-auth-flow', 
    description: 'User authentication validation flow'
  },
];

interface FlowFilterEditorProps {
  selectedFlows: string[];
  onSelectionChange: (flows: string[]) => void;
  onClose: () => void;
  onReset?: () => void;
  options?: FlowOption[];
}

export default function FlowFilterEditor({ 
  selectedFlows, 
  onSelectionChange, 
  onClose,
  onReset,
  options
}: FlowFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state to track current values vs original props
  const [currentFlows, setCurrentFlows] = useState(selectedFlows);
  const availableFlows = options ?? defaultFlowOptions;

  // Sync local state with props when they change (important for reset functionality)
  useEffect(() => {
    setCurrentFlows(selectedFlows);
  }, [selectedFlows]);

  const filteredFlows = availableFlows.filter(flow =>
    flow.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFlow = (flowId: string) => {
    const isSelected = currentFlows.includes(flowId);
    if (isSelected) {
      setCurrentFlows(currentFlows.filter(id => id !== flowId));
    } else {
      setCurrentFlows([...currentFlows, flowId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleFlows = filteredFlows.map(flow => flow.id);
    const combinedFlows = [...currentFlows, ...allVisibleFlows];
    const newSelection = Array.from(new Set(combinedFlows));
    setCurrentFlows(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleFlowIds = filteredFlows.map(flow => flow.id);
    const newSelection = currentFlows.filter(id => !visibleFlowIds.includes(id));
    setCurrentFlows(newSelection);
  };

  const allVisible = filteredFlows.every(flow => currentFlows.includes(flow.id));
  const noneVisible = filteredFlows.every(flow => !currentFlows.includes(flow.id));
  
  const handleApply = () => {
    onSelectionChange(currentFlows);
    onClose();
  };
  
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentFlows(selectedFlows);
    }
  };

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
            const isSelected = currentFlows.includes(flow.id);
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
            {currentFlows.length} flow{currentFlows.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="px-2"
                    data-testid="button-reset-flow-filter"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset to default</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1"
              data-testid="button-apply-flow-filter"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
