import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Info, RotateCcw, CheckCircle, Play, XCircle, X, AlertTriangle, Pause, Ban, SkipForward, Clock, RefreshCw, Circle } from "lucide-react";

const stateOptions = [
  { 
    id: 'CREATED', 
    label: 'CREATED', 
    icon: Info,
    description: 'Execution has been created'
  },
  { 
    id: 'RESTARTED', 
    label: 'RESTARTED', 
    icon: RotateCcw,
    description: 'Execution has been restarted'
  },
  { 
    id: 'SUCCESS', 
    label: 'SUCCESS', 
    icon: CheckCircle,
    description: 'Execution completed successfully'
  },
  { 
    id: 'RUNNING', 
    label: 'RUNNING', 
    icon: Play,
    description: 'Execution is currently running'
  },
  { 
    id: 'KILLING', 
    label: 'KILLING', 
    icon: XCircle,
    description: 'Execution is being killed'
  },
  { 
    id: 'KILLED', 
    label: 'KILLED', 
    icon: X,
    description: 'Execution has been killed'
  },
  { 
    id: 'WARNING', 
    label: 'WARNING', 
    icon: AlertTriangle,
    description: 'Execution completed with warnings'
  },
  { 
    id: 'FAILED', 
    label: 'FAILED', 
    icon: XCircle,
    description: 'Execution has failed'
  },
  { 
    id: 'PAUSED', 
    label: 'PAUSED', 
    icon: Pause,
    description: 'Execution has been paused'
  },
  { 
    id: 'CANCELLED', 
    label: 'CANCELLED', 
    icon: Ban,
    description: 'Execution has been cancelled'
  },
  { 
    id: 'SKIPPED', 
    label: 'SKIPPED', 
    icon: SkipForward,
    description: 'Execution has been skipped'
  },
  { 
    id: 'QUEUED', 
    label: 'QUEUED', 
    icon: Clock,
    description: 'Execution is queued for processing'
  },
  { 
    id: 'RETRYING', 
    label: 'RETRYING', 
    icon: RefreshCw,
    description: 'Execution is being retried'
  },
  { 
    id: 'RETRIED', 
    label: 'RETRIED', 
    icon: RotateCcw,
    description: 'Execution has been retried'
  },
  { 
    id: 'BREAKPOINT', 
    label: 'BREAKPOINT', 
    icon: Circle,
    description: 'Execution stopped at breakpoint'
  },
];

interface StateFilterEditorProps {
  selectedStates: string[];
  onSelectionChange: (states: string[]) => void;
  onClose: () => void;
}

export default function StateFilterEditor({ 
  selectedStates, 
  onSelectionChange, 
  onClose 
}: StateFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = stateOptions.filter(state =>
    state.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleState = (stateId: string) => {
    const isSelected = selectedStates.includes(stateId);
    if (isSelected) {
      onSelectionChange(selectedStates.filter(id => id !== stateId));
    } else {
      onSelectionChange([...selectedStates, stateId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleStates = filteredStates.map(state => state.id);
    const combinedStates = [...selectedStates, ...allVisibleStates];
    const newSelection = Array.from(new Set(combinedStates));
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleStateIds = filteredStates.map(state => state.id);
    const newSelection = selectedStates.filter(id => !visibleStateIds.includes(id));
    onSelectionChange(newSelection);
  };

  const allVisible = filteredStates.every(state => selectedStates.includes(state.id));
  const noneVisible = filteredStates.every(state => !selectedStates.includes(state.id));

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="input-state-search"
        />
        
        {/* Select All / Deselect All */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            disabled={allVisible}
            className={`flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md ${
              allVisible 
                ? 'text-blue-400 cursor-not-allowed' 
                : 'text-blue-500 hover:text-blue-400'
            }`}
            data-testid="button-select-all"
          >
            <CheckSquare className="h-4 w-4" />
            Select All
          </button>
          
          <button
            onClick={handleDeselectAll}
            disabled={noneVisible}
            className={`flex items-center gap-2 text-sm hover-elevate px-3 py-2 rounded-md ${
              noneVisible 
                ? 'text-muted-foreground cursor-not-allowed' 
                : 'text-foreground hover:text-muted-foreground'
            }`}
            data-testid="button-deselect-all"
          >
            <Square className="h-4 w-4" />
            Deselect All
          </button>
        </div>
      </div>

      {/* State Options */}
      <div className="max-h-64 overflow-y-auto">
        {filteredStates.map((state) => {
          const isSelected = selectedStates.includes(state.id);
          const IconComponent = state.icon;
          
          return (
            <div
              key={state.id}
              onClick={() => handleToggleState(state.id)}
              className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer"
              data-testid={`state-option-${state.id.toLowerCase()}`}
            >
              {/* State Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                isSelected 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                  : 'bg-muted border-border text-muted-foreground'
              }`}>
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">{state.label}</span>
              </div>
              
              {/* Checkmark */}
              <div className="ml-auto">
                {isSelected ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <div className="h-5 w-5 rounded border border-border" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selectedStates.length} of {stateOptions.length} states selected
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-cancel-state-filter"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            data-testid="button-apply-state-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}