import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, Info, RotateCcw, CheckCircle, Play, XCircle, X, AlertTriangle, Pause, Ban, SkipForward, Clock, RefreshCw, Circle } from "lucide-react";

const operatorOptions = [
  { id: 'in', label: 'in', description: 'Execution state is one of the selected states' },
  { id: 'not-in', label: 'not in', description: 'Execution state is not one of the selected states' },
];

export interface StateOption {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}

const defaultStateOptions: StateOption[] = [
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
  statesOperator: string;
  onSelectionChange: (states: string[]) => void;
  onOperatorChange: (operator: string) => void;
  onClose: () => void;
  onReset?: () => void;
  stateOptions?: StateOption[];
}

export default function StateFilterEditor({ 
  selectedStates, 
  statesOperator,
  onSelectionChange, 
  onOperatorChange,
  onClose,
  onReset,
  stateOptions
}: StateFilterEditorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStates, setCurrentStates] = useState(selectedStates);
  const [currentOperator, setCurrentOperator] = useState(statesOperator);

  const availableStates = stateOptions ?? defaultStateOptions;

  // Sync local state with props when they change (important for reset functionality)
  useEffect(() => {
    setCurrentStates(selectedStates);
  }, [selectedStates]);

  useEffect(() => {
    setCurrentOperator(statesOperator);
  }, [statesOperator]);

  const filteredStates = availableStates.filter(state =>
    state.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleState = (stateId: string) => {
    const isSelected = currentStates.includes(stateId);
    if (isSelected) {
      setCurrentStates(currentStates.filter(id => id !== stateId));
    } else {
      setCurrentStates([...currentStates, stateId]);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setCurrentStates(selectedStates);
      setCurrentOperator(statesOperator);
    }
  };

  const handleApply = () => {
    onSelectionChange(currentStates);
    onOperatorChange(currentOperator);
    onClose();
  };

  const handleSelectAll = () => {
    const allVisibleStates = filteredStates.map(state => state.id);
    const combinedStates = [...currentStates, ...allVisibleStates];
    const newSelection = Array.from(new Set(combinedStates));
    setCurrentStates(newSelection);
  };

  const handleDeselectAll = () => {
    const visibleStateIds = filteredStates.map(state => state.id);
    const newSelection = currentStates.filter(id => !visibleStateIds.includes(id));
    setCurrentStates(newSelection);
  };

  const allVisible = filteredStates.every(state => currentStates.includes(state.id));
  const noneVisible = filteredStates.every(state => !currentStates.includes(state.id));

  const selectedOperatorObj = operatorOptions.find(op => op.id === currentOperator);

  return (
    <Card className="w-96 p-0 bg-popover border border-popover-border shadow-lg">
      {/* Header with operator and search */}
      <div className="p-4 border-b border-border bg-[#2F3341]">
        {/* Operator Selection */}
        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Filter Operator</label>
          <Select value={currentOperator} onValueChange={setCurrentOperator} data-testid="select-states-operator">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select operator...">
                {selectedOperatorObj?.label || "Select operator..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.id} value={option.id} data-testid={`states-operator-${option.id}`}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Input
          placeholder="Search state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          data-testid="input-state-search"
        />
        
        {/* Select All / Deselect All */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allVisible}
            className="flex-1"
            data-testid="button-select-all"
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
            data-testid="button-deselect-all"
          >
            <Square className="w-3 h-3 mr-1" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* State Options */}
      <div className="max-h-64 overflow-y-auto">
        {filteredStates.map((state) => {
          const isSelected = currentStates.includes(state.id);
          const IconComponent = state.icon;
          
          return (
            <div
              key={state.id}
              onClick={() => handleToggleState(state.id)}
              className="flex items-center gap-3 p-3 border-b border-border/50 hover:bg-[#3A3F4F] cursor-pointer"
              data-testid={`state-option-${state.id.toLowerCase()}`}
            >
              {/* State Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                isSelected 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                  : 'bg-[#2F3341] border-border text-muted-foreground'
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
      <div className="p-4 border-t border-border bg-[#2F3341] flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {currentStates.length} of {availableStates.length} states selected
        </p>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="px-2"
                  data-testid="button-reset-state-filter"
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
            data-testid="button-apply-state-filter"
          >
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
