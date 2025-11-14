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
import { ChevronDown, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import InputOutputEditor from './InputOutputEditor';
import ColorPicker from '@/components/ColorPicker';

interface FlowPropertiesPanelProps {
  properties: FlowProperties;
  selectedNode?: Node;
  onPropertiesChange: (properties: FlowProperties) => void;
  onNodeUpdate?: (nodeId: string, data: any) => void;
  onNodeDelete?: (nodeId: string) => void;
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-id">ID</Label>
                <Input
                  id="node-id"
                  value={nodeConfig.id || ''}
                  onChange={(e) => {
                    if (onNodeUpdate) {
                      onNodeUpdate(selectedNode.id, {
                        config: {
                          ...nodeConfig,
                          id: e.target.value,
                        },
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="node-type">Type</Label>
                <Input
                  id="node-type"
                  value={nodeConfig.type || ''}
                  onChange={(e) => {
                    if (onNodeUpdate) {
                      onNodeUpdate(selectedNode.id, {
                        config: {
                          ...nodeConfig,
                          type: e.target.value,
                        },
                      });
                    }
                  }}
                  className="mt-1"
                  placeholder="e.g., io.kestra.plugin.core.log.Log"
                />
              </div>
              <div>
                <Label htmlFor="node-description">Description</Label>
                <Textarea
                  id="node-description"
                  value={nodeConfig.description || ''}
                  onChange={(e) => {
                    if (onNodeUpdate) {
                      onNodeUpdate(selectedNode.id, {
                        config: {
                          ...nodeConfig,
                          description: e.target.value,
                        },
                      });
                    }
                  }}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
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

