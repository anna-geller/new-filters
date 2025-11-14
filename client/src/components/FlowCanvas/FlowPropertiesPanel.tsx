import { useState } from 'react';
import { Node } from '@xyflow/react';
import yaml from 'js-yaml';
import { FlowProperties } from '@/types/canvas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, Plus, X, Trash2, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import InputOutputEditor from './InputOutputEditor';
import ColorPicker from '@/components/ColorPicker';
import { getTaskMetadata } from '@/data/taskMetadata';

interface FlowPropertiesPanelProps {
  properties: FlowProperties;
  selectedNode?: Node;
  onPropertiesChange: (properties: FlowProperties) => void;
  onNodeUpdate?: (nodeId: string, data: any) => void;
  onNodeDelete?: (nodeId: string) => void;
}

interface TaskPropertiesViewProps {
  nodeConfig: any;
  nodeLabel?: string;
  onNodeUpdate?: (nodeId: string, data: any) => void;
  selectedNodeId: string;
}

function TaskPropertiesView({ nodeConfig, nodeLabel, onNodeUpdate, selectedNodeId }: TaskPropertiesViewProps) {
  const [corePropertiesOpen, setCorePropertiesOpen] = useState(false);
  const pluginType = nodeConfig.type || '';
  const taskMetadata = getTaskMetadata(pluginType);
  
  const requiredTaskProperties = taskMetadata?.properties.filter(p => p.required) || [];
  const optionalTaskProperties = taskMetadata?.properties.filter(p => !p.required) || [];

  const handlePropertyChange = (propertyName: string, value: any) => {
    if (onNodeUpdate) {
      const updates: any = {
        config: {
          ...nodeConfig,
          [propertyName]: value,
        },
      };
      
      // Sync label when ID changes, but only if label currently matches the old ID
      // This preserves custom labels that users may have set
      if (propertyName === 'id' && nodeLabel === nodeConfig.id) {
        updates.label = value;
      }
      
      onNodeUpdate(selectedNodeId, updates);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, propertyName: string) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain');
    // Replace value instead of concatenating
    handlePropertyChange(propertyName, droppedText);
  };

  const renderPropertyInput = (property: any) => {
    const value = nodeConfig[property.name] ?? property.default ?? '';
    
    return (
      <div key={property.name} className="space-y-2">
        <Label htmlFor={property.name} className="text-sm font-medium text-foreground">
          {property.name}
          {property.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {property.description && (
          <p className="text-xs text-muted-foreground">{property.description}</p>
        )}

        {property.type === 'string' && (
          property.name.toLowerCase().includes('format') || 
          property.name.toLowerCase().includes('message') ||
          property.name.toLowerCase().includes('script') ? (
            <Textarea
              id={property.name}
              value={value}
              onChange={(e) => handlePropertyChange(property.name, e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, property.name)}
              placeholder={property.placeholder}
              className="bg-[#262A35] border-[#3A3F4F] text-foreground font-mono text-sm min-h-[100px]"
              data-testid={`input-${property.name}`}
            />
          ) : (
            <Input
              id={property.name}
              type="text"
              value={value}
              onChange={(e) => handlePropertyChange(property.name, e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, property.name)}
              placeholder={property.placeholder}
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid={`input-${property.name}`}
            />
          )
        )}

        {property.type === 'number' && (
          <Input
            id={property.name}
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(property.name, parseFloat(e.target.value))}
            placeholder={property.placeholder}
            className="bg-[#262A35] border-[#3A3F4F] text-foreground"
            data-testid={`input-${property.name}`}
          />
        )}

        {property.type === 'boolean' && (
          <div className="flex items-center gap-2">
            <Switch
              id={property.name}
              checked={value}
              onCheckedChange={(checked) => handlePropertyChange(property.name, checked)}
              data-testid={`switch-${property.name}`}
            />
            <Label htmlFor={property.name} className="text-sm text-muted-foreground">
              {value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        )}

        {property.type === 'select' && property.options && (
          <Select
            value={value}
            onValueChange={(newValue) => handlePropertyChange(property.name, newValue)}
          >
            <SelectTrigger 
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid={`select-${property.name}`}
            >
              <SelectValue placeholder={`Select ${property.name}`} />
            </SelectTrigger>
            <SelectContent className="bg-[#262A35] border-[#3A3F4F]">
              {property.options.map((option: any) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-foreground hover:bg-[#1F232D]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {property.helpUrl && (
          <a 
            href={property.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#8408FF] hover:text-[#8613f7]"
            data-testid={`link-help-${property.name}`}
          >
            Learn more
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="task-properties-panel">
      {/* ID - Always First */}
      <div className="space-y-2">
        <Label htmlFor="node-id" className="text-sm font-medium text-foreground">
          ID <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="node-id"
          type="text"
          value={nodeConfig.id || ''}
          onChange={(e) => handlePropertyChange('id', e.target.value)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'id')}
          placeholder="task-id"
          className="bg-[#262A35] border-[#3A3F4F] text-foreground"
          data-testid="input-id"
        />
      </div>

      {/* Type - Always Second */}
      <div className="space-y-2">
        <Label htmlFor="node-type" className="text-sm font-medium text-foreground">
          Type <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="node-type"
          type="text"
          value={nodeConfig.type || ''}
          onChange={(e) => handlePropertyChange('type', e.target.value)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'type')}
          placeholder="io.kestra.plugin.core.log.Log"
          className="bg-[#262A35] border-[#3A3F4F] text-foreground font-mono text-sm"
          data-testid="input-type"
        />
      </div>

      {/* Required Task Properties */}
      {requiredTaskProperties.length > 0 && (
        <div className="space-y-4">
          {requiredTaskProperties.map(property => renderPropertyInput(property))}
        </div>
      )}

      {/* Task Description */}
      {taskMetadata?.description && (
        <div className="bg-[#262A35] border border-[#3A3F4F] rounded p-3">
          <p className="text-xs text-muted-foreground">{taskMetadata.description}</p>
          {taskMetadata.documentationUrl && (
            <a 
              href={taskMetadata.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#8408FF] hover:text-[#8613f7] mt-2"
              data-testid="link-documentation"
            >
              View documentation
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Optional Task Properties */}
      {optionalTaskProperties.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Optional Task Properties
          </h4>
          {optionalTaskProperties.map(property => renderPropertyInput(property))}
        </div>
      )}

      {/* Optional Core Properties - Collapsible (Collapsed by Default) */}
      <Collapsible open={corePropertiesOpen} onOpenChange={setCorePropertiesOpen}>
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full p-3 bg-[#262A35] hover:bg-[#2A2E3A] border border-[#3A3F4F] rounded transition-colors"
          data-testid="trigger-core-properties"
        >
          <h4 className="text-xs font-semibold text-foreground uppercase">
            Optional Core Properties
          </h4>
          <ChevronDown 
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              corePropertiesOpen ? 'rotate-180' : ''
            }`} 
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="node-description"
              value={nodeConfig.description || ''}
              onChange={(e) => handlePropertyChange('description', e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'description')}
              placeholder="Describe what this task does..."
              className="bg-[#262A35] border-[#3A3F4F] text-foreground min-h-[80px]"
              data-testid="input-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-retry" className="text-sm font-medium text-foreground">
              Retry
            </Label>
            <Input
              id="node-retry"
              type="text"
              value={nodeConfig.retry || ''}
              onChange={(e) => handlePropertyChange('retry', e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'retry')}
              placeholder="Retry configuration"
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid="input-retry"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-timeout" className="text-sm font-medium text-foreground">
              Timeout
            </Label>
            <Input
              id="node-timeout"
              type="text"
              value={nodeConfig.timeout || ''}
              onChange={(e) => handlePropertyChange('timeout', e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'timeout')}
              placeholder="PT1H (ISO 8601 duration)"
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid="input-timeout"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-runif" className="text-sm font-medium text-foreground">
              RunIf
            </Label>
            <Input
              id="node-runif"
              type="text"
              value={nodeConfig.runIf || ''}
              onChange={(e) => handlePropertyChange('runIf', e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'runIf')}
              placeholder="Condition to run task"
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid="input-runif"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-disabled" className="text-sm font-medium text-foreground">
              Disabled
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="node-disabled"
                checked={nodeConfig.disabled || false}
                onCheckedChange={(checked) => handlePropertyChange('disabled', checked)}
                data-testid="switch-disabled"
              />
              <span className="text-sm text-muted-foreground">
                {nodeConfig.disabled ? 'Task is disabled' : 'Task is enabled'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-workergroup" className="text-sm font-medium text-foreground">
              Worker Group
            </Label>
            <Input
              id="node-workergroup"
              type="text"
              value={nodeConfig.workerGroup || ''}
              onChange={(e) => handlePropertyChange('workerGroup', e.target.value)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'workerGroup')}
              placeholder="Worker group configuration"
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid="input-workergroup"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-allowfailure" className="text-sm font-medium text-foreground">
              Allow Failure
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="node-allowfailure"
                checked={nodeConfig.allowFailure || false}
                onCheckedChange={(checked) => handlePropertyChange('allowFailure', checked)}
                data-testid="switch-allowfailure"
              />
              <span className="text-sm text-muted-foreground">
                {nodeConfig.allowFailure ? 'Continue on failure' : 'Stop on failure'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-allowwarning" className="text-sm font-medium text-foreground">
              Allow Warning
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="node-allowwarning"
                checked={nodeConfig.allowWarning || false}
                onCheckedChange={(checked) => handlePropertyChange('allowWarning', checked)}
                data-testid="switch-allowwarning"
              />
              <span className="text-sm text-muted-foreground">
                {nodeConfig.allowWarning ? 'Mark as success despite warnings' : 'Warnings are errors'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-loglevel" className="text-sm font-medium text-foreground">
              Log Level
            </Label>
            <Select
              value={nodeConfig.logLevel || 'INFO'}
              onValueChange={(value) => handlePropertyChange('logLevel', value)}
            >
              <SelectTrigger className="bg-[#262A35] border-[#3A3F4F] text-foreground" data-testid="select-loglevel">
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent className="bg-[#262A35] border-[#3A3F4F]">
                <SelectItem value="TRACE" className="text-foreground hover:bg-[#1F232D]">TRACE</SelectItem>
                <SelectItem value="DEBUG" className="text-foreground hover:bg-[#1F232D]">DEBUG</SelectItem>
                <SelectItem value="INFO" className="text-foreground hover:bg-[#1F232D]">INFO</SelectItem>
                <SelectItem value="WARN" className="text-foreground hover:bg-[#1F232D]">WARN</SelectItem>
                <SelectItem value="ERROR" className="text-foreground hover:bg-[#1F232D]">ERROR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-logtofile" className="text-sm font-medium text-foreground">
              Log to File
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="node-logtofile"
                checked={nodeConfig.logToFile || false}
                onCheckedChange={(checked) => handlePropertyChange('logToFile', checked)}
                data-testid="switch-logtofile"
              />
              <span className="text-sm text-muted-foreground">
                {nodeConfig.logToFile ? 'Store logs as file' : 'Store logs in database'}
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function FlowPropertiesPanel({
  properties,
  selectedNode,
  onPropertiesChange,
  onNodeUpdate,
  onNodeDelete,
}: FlowPropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    concurrency: false,
    arrays: false,
    advanced: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateProperty = <K extends keyof FlowProperties>(
    key: K,
    value: FlowProperties[K]
  ) => {
    onPropertiesChange({
      ...properties,
      [key]: value,
    });
  };

  const [newLabelKey, setNewLabelKey] = useState('');
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newVariableKey, setNewVariableKey] = useState('');
  const [showNewVariable, setShowNewVariable] = useState(false);

  const addLabel = () => {
    if (newLabelKey.trim()) {
      updateProperty('labels', {
        ...properties.labels,
        [newLabelKey.trim()]: '',
      });
      setNewLabelKey('');
      setShowNewLabel(false);
    }
  };

  const removeLabel = (key: string) => {
    const newLabels = { ...properties.labels };
    delete newLabels[key];
    updateProperty('labels', newLabels);
  };

  const updateLabelKey = (oldKey: string, newKey: string) => {
    const newLabels = { ...properties.labels };
    const value = newLabels[oldKey];
    delete newLabels[oldKey];
    newLabels[newKey] = value;
    updateProperty('labels', newLabels);
  };

  const updateLabelValue = (key: string, value: string) => {
    updateProperty('labels', {
      ...properties.labels,
      [key]: value,
    });
  };

  const addVariable = () => {
    if (newVariableKey.trim()) {
      updateProperty('variables', {
        ...properties.variables,
        [newVariableKey.trim()]: '',
      });
      setNewVariableKey('');
      setShowNewVariable(false);
    }
  };

  const removeVariable = (key: string) => {
    const newVariables = { ...properties.variables };
    delete newVariables[key];
    updateProperty('variables', newVariables);
  };

  const updateVariableKey = (oldKey: string, newKey: string) => {
    const newVariables = { ...properties.variables };
    const value = newVariables[oldKey];
    delete newVariables[oldKey];
    newVariables[newKey] = value;
    updateProperty('variables', newVariables);
  };

  const updateVariableValue = (key: string, value: any) => {
    updateProperty('variables', {
      ...properties.variables,
      [key]: value,
    });
  };

  // Render selected node properties
  if (selectedNode) {
    const nodeConfig = selectedNode.data.config as any || {};
    return (
      <div className="w-96 bg-[#262A35] border-l border-border overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Node Properties</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedNode.data.label as string}
              </p>
            </div>
            {onNodeDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNodeDelete(selectedNode.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          {(selectedNode.type === 'input' || selectedNode.type === 'output') ? (
            <InputOutputEditor
              nodeType={selectedNode.type}
              config={nodeConfig}
              onChange={(newConfig) => {
                if (onNodeUpdate) {
                  // Use displayName or id for label
                  const label = newConfig.displayName || newConfig.id;
                  onNodeUpdate(selectedNode.id, {
                    label,
                    config: newConfig,
                  });
                }
              }}
            />
          ) : selectedNode.type === 'note' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-id">ID</Label>
                <Input
                  id="note-id"
                  value={nodeConfig.id || ''}
                  onChange={(e) => {
                    if (onNodeUpdate) {
                      onNodeUpdate(selectedNode.id, {
                        label: e.target.value,
                        config: {
                          ...nodeConfig,
                          id: e.target.value,
                        },
                      });
                    }
                  }}
                  className="mt-1"
                  placeholder="note-id"
                  data-testid="input-note-id"
                />
              </div>
              <div>
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={nodeConfig.text || ''}
                  onChange={(e) => {
                    if (onNodeUpdate) {
                      onNodeUpdate(selectedNode.id, {
                        config: {
                          ...nodeConfig,
                          text: e.target.value,
                        },
                      });
                    }
                  }}
                  className="mt-1"
                  rows={5}
                  placeholder="Enter your note content..."
                  data-testid="input-note-content"
                />
              </div>
              <div data-testid="colorpicker-note-color">
                <ColorPicker
                  value={nodeConfig.color || '#9B8B6B'}
                  onChange={(color: string) => {
                    if (onNodeUpdate) {
                      onNodeUpdate(selectedNode.id, {
                        config: {
                          ...nodeConfig,
                          color,
                        },
                      });
                    }
                  }}
                  label="Color"
                />
              </div>
            </div>
          ) : (
            <TaskPropertiesView 
              nodeConfig={nodeConfig}
              nodeLabel={selectedNode.data.label as string}
              onNodeUpdate={onNodeUpdate}
              selectedNodeId={selectedNode.id}
            />
          )}
        </ScrollArea>
      </div>
    );
  }

  // Render flow properties
  return (
    <div className="w-96 bg-[#262A35] border-l border-border overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Flow Properties</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure flow-level settings
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Basic Properties */}
          <Collapsible open={expandedSections.basic}>
            <CollapsibleTrigger
              onClick={() => toggleSection('basic')}
              className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <span>Basic Properties</span>
              {expandedSections.basic ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-2">
              <div>
                <Label htmlFor="flow-id">ID *</Label>
                <Input
                  id="flow-id"
                  value={properties.id}
                  onChange={(e) => updateProperty('id', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="flow-namespace">Namespace *</Label>
                <Input
                  id="flow-namespace"
                  value={properties.namespace}
                  onChange={(e) => updateProperty('namespace', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="flow-description">Description</Label>
                <Textarea
                  id="flow-description"
                  value={properties.description || ''}
                  onChange={(e) => updateProperty('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="flow-disabled">Disabled</Label>
                <Switch
                  id="flow-disabled"
                  checked={properties.disabled || false}
                  onCheckedChange={(checked) => updateProperty('disabled', checked)}
                />
              </div>
              <div>
                <Label htmlFor="flow-workerGroup">Worker Group</Label>
                <Input
                  id="flow-workerGroup"
                  value={properties.workerGroup || ''}
                  onChange={(e) => updateProperty('workerGroup', e.target.value)}
                  className="mt-1"
                  placeholder="default"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Concurrency */}
          <Collapsible open={expandedSections.concurrency}>
            <CollapsibleTrigger
              onClick={() => toggleSection('concurrency')}
              className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <span>Concurrency</span>
              {expandedSections.concurrency ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-2">
              <div>
                <Label htmlFor="concurrency-behavior">Behavior</Label>
                <Select
                  value={properties.concurrency?.behavior || 'QUEUE'}
                  onValueChange={(value: 'QUEUE' | 'CANCEL' | 'FAIL') =>
                    updateProperty('concurrency', {
                      ...properties.concurrency,
                      behavior: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUEUE">Queue</SelectItem>
                    <SelectItem value="CANCEL">Cancel</SelectItem>
                    <SelectItem value="FAIL">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="concurrency-limit">Limit</Label>
                <Input
                  id="concurrency-limit"
                  type="number"
                  value={properties.concurrency?.limit || ''}
                  onChange={(e) =>
                    updateProperty('concurrency', {
                      ...properties.concurrency,
                      limit: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="mt-1"
                  placeholder="No limit"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Labels & Variables */}
          <Collapsible open={expandedSections.arrays}>
            <CollapsibleTrigger
              onClick={() => toggleSection('arrays')}
              className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <span>Labels & Variables</span>
              {expandedSections.arrays ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Labels</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewLabel(!showNewLabel)}
                    className="h-6 px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span className="text-xs">Add</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  {showNewLabel && (
                    <div className="flex items-center gap-2 p-2 bg-[#1F232D] rounded-md border border-border">
                      <Input
                        value={newLabelKey}
                        onChange={(e) => setNewLabelKey(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addLabel();
                          if (e.key === 'Escape') setShowNewLabel(false);
                        }}
                        className="flex-1 text-xs bg-[#262A35]"
                        placeholder="Key"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={addLabel}
                        disabled={!newLabelKey.trim()}
                        className="h-8 px-2 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowNewLabel(false);
                          setNewLabelKey('');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {Object.entries(properties.labels || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        value={key}
                        onChange={(e) => updateLabelKey(key, e.target.value)}
                        className="flex-1 text-xs bg-[#1F232D]"
                        placeholder="Key"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateLabelValue(key, e.target.value)}
                        className="flex-1 text-xs bg-[#1F232D]"
                        placeholder="Value"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLabel(key)}
                        className="h-8 w-8 p-0 hover:bg-destructive/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Variables</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewVariable(!showNewVariable)}
                    className="h-6 px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span className="text-xs">Add</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  {showNewVariable && (
                    <div className="flex items-center gap-2 p-2 bg-[#1F232D] rounded-md border border-border">
                      <Input
                        value={newVariableKey}
                        onChange={(e) => setNewVariableKey(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addVariable();
                          if (e.key === 'Escape') setShowNewVariable(false);
                        }}
                        className="flex-1 text-xs bg-[#262A35]"
                        placeholder="Key"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={addVariable}
                        disabled={!newVariableKey.trim()}
                        className="h-8 px-2 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowNewVariable(false);
                          setNewVariableKey('');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {Object.entries(properties.variables || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        value={key}
                        onChange={(e) => updateVariableKey(key, e.target.value)}
                        className="flex-1 text-xs bg-[#1F232D]"
                        placeholder="Key"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateVariableValue(key, e.target.value)}
                        className="flex-1 text-xs bg-[#1F232D]"
                        placeholder="Value"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeVariable(key)}
                        className="h-8 w-8 p-0 hover:bg-destructive/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Advanced */}
          <Collapsible open={expandedSections.advanced}>
            <CollapsibleTrigger
              onClick={() => toggleSection('advanced')}
              className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:text-foreground/80"
            >
              <span>Advanced</span>
              {expandedSections.advanced ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-2">
              <div>
                <Label htmlFor="retry-maxAttempt">Retry Max Attempts</Label>
                <Input
                  id="retry-maxAttempt"
                  type="number"
                  value={properties.retry?.maxAttempt || ''}
                  onChange={(e) =>
                    updateProperty('retry', {
                      ...properties.retry,
                      maxAttempt: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sla-duration">SLA Duration</Label>
                <Input
                  id="sla-duration"
                  value={properties.sla?.duration || ''}
                  onChange={(e) =>
                    updateProperty('sla', {
                      ...properties.sla,
                      duration: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="PT1H"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}

