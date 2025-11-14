import { Node } from '@xyflow/react';
import { TaskMetadata } from '@/data/taskMetadata';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import ColorPicker from '@/components/ColorPicker';

interface PropertiesPanelProps {
  node: Node;
  taskMetadata?: TaskMetadata;
  onConfigChange: (newConfig: any) => void;
}

export default function PropertiesPanel({ node, taskMetadata, onConfigChange }: PropertiesPanelProps) {
  const config = node.data.config as any || {};
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [node.id, config]);

  const handlePropertyChange = (propertyName: string, value: any) => {
    const newConfig = { ...localConfig, [propertyName]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, propertyName: string) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain');
    const currentValue = localConfig[propertyName] || '';
    const newValue = currentValue + droppedText;
    handlePropertyChange(propertyName, newValue);
  };

  const hasTaskProperties = taskMetadata && taskMetadata.properties && taskMetadata.properties.length > 0;
  const isNoteNode = node.type === 'note';
  const isOutputNode = node.type === 'output';
  
  // Separate required and optional task properties
  const requiredTaskProperties = taskMetadata?.properties.filter(p => p.required) || [];
  const optionalTaskProperties = taskMetadata?.properties.filter(p => !p.required) || [];

  // Sticky Note UI
  if (isNoteNode) {
    return (
      <div className="p-4 space-y-6" data-testid="properties-panel">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Note Properties
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor="note-id" className="text-sm font-medium text-foreground">
              ID <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="note-id"
              type="text"
              value={localConfig.id || ''}
              onChange={(e) => handlePropertyChange('id', e.target.value)}
              placeholder="note-id"
              className="bg-[#262A35] border-[#3A3F4F] text-foreground"
              data-testid="input-id"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content" className="text-sm font-medium text-foreground">
              Content
            </Label>
            <Textarea
              id="note-content"
              value={localConfig.text || ''}
              onChange={(e) => handlePropertyChange('text', e.target.value)}
              placeholder="Enter your note content..."
              className="bg-[#262A35] border-[#3A3F4F] text-foreground min-h-[120px]"
              data-testid="input-content"
            />
          </div>

          <ColorPicker
            value={localConfig.color || '#9B8B6B'}
            onChange={(color) => handlePropertyChange('color', color)}
            label="Color"
          />
        </div>
      </div>
    );
  }

  // Output Node UI
  if (isOutputNode && taskMetadata) {
    return (
      <div className="p-4 space-y-6" data-testid="properties-panel">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Flow Output Configuration
          </h4>
          
          {taskMetadata.properties.map((property) => {
            const value = localConfig[property.name] ?? property.default ?? '';
            
            return (
              <div key={property.name} className="space-y-2">
                <Label htmlFor={property.name} className="text-sm font-medium text-foreground">
                  {property.name === 'type' ? 'Type' : 
                   property.name === 'id' ? 'ID' :
                   property.name === 'displayName' ? 'Display Name' :
                   property.name === 'description' ? 'Description' :
                   property.name === 'validator' ? 'Validator' :
                   property.name === 'prefill' ? 'Prefill' :
                   property.name === 'value' ? 'Value' :
                   property.name === 'required' ? 'Required' :
                   property.name}
                  {property.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {property.description && (
                  <p className="text-xs text-muted-foreground">{property.description}</p>
                )}

                {property.type === 'select' && property.options ? (
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
                ) : property.type === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={property.name}
                      checked={value}
                      onCheckedChange={(checked) => handlePropertyChange(property.name, checked)}
                      data-testid={`switch-${property.name}`}
                    />
                    <Label htmlFor={property.name} className="text-sm text-muted-foreground">
                      {value ? 'Yes' : 'No'}
                    </Label>
                  </div>
                ) : property.name === 'description' || property.name === 'value' ? (
                  <Textarea
                    id={property.name}
                    value={value}
                    onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, property.name)}
                    placeholder={property.placeholder}
                    className="bg-[#262A35] border-[#3A3F4F] text-foreground font-mono text-sm min-h-[80px]"
                    data-testid={`input-${property.name}`}
                  />
                ) : (
                  <Input
                    id={property.name}
                    type="text"
                    value={value}
                    onChange={(e) => handlePropertyChange(property.name, e.target.value)}
                    onDragOver={property.name === 'validator' || property.name === 'prefill' ? handleDragOver : undefined}
                    onDrop={property.name === 'validator' || property.name === 'prefill' ? (e) => handleDrop(e, property.name) : undefined}
                    placeholder={property.placeholder}
                    className="bg-[#262A35] border-[#3A3F4F] text-foreground"
                    data-testid={`input-${property.name}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render property input based on type
  const renderPropertyInput = (property: any) => {
    const value = localConfig[property.name] ?? property.default ?? '';
    
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
          >
            Learn more
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  };

  // Regular Task Node UI
  return (
    <div className="p-4 space-y-6" data-testid="properties-panel">
      {/* ID - Always First */}
      <div className="space-y-2">
        <Label htmlFor="node-id" className="text-sm font-medium text-foreground">
          ID <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="node-id"
          type="text"
          value={localConfig.id || ''}
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
          value={localConfig.type || ''}
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
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-[#262A35] hover:bg-[#2A2E3A] border border-[#3A3F4F] rounded transition-colors">
          <h4 className="text-xs font-semibold text-foreground uppercase">
            Optional Core Properties
          </h4>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="node-description"
              value={localConfig.description || ''}
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
              value={localConfig.retry || ''}
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
              value={localConfig.timeout || ''}
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
              value={localConfig.runIf || ''}
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
                checked={localConfig.disabled || false}
                onCheckedChange={(checked) => handlePropertyChange('disabled', checked)}
                data-testid="switch-disabled"
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.disabled ? 'Task is disabled' : 'Task is enabled'}
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
              value={localConfig.workerGroup || ''}
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
                checked={localConfig.allowFailure || false}
                onCheckedChange={(checked) => handlePropertyChange('allowFailure', checked)}
                data-testid="switch-allowfailure"
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.allowFailure ? 'Continue on failure' : 'Stop on failure'}
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
                checked={localConfig.allowWarning || false}
                onCheckedChange={(checked) => handlePropertyChange('allowWarning', checked)}
                data-testid="switch-allowwarning"
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.allowWarning ? 'Mark as success despite warnings' : 'Warnings are errors'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-loglevel" className="text-sm font-medium text-foreground">
              Log Level
            </Label>
            <Select
              value={localConfig.logLevel || 'INFO'}
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
                checked={localConfig.logToFile || false}
                onCheckedChange={(checked) => handlePropertyChange('logToFile', checked)}
                data-testid="switch-logtofile"
              />
              <span className="text-sm text-muted-foreground">
                {localConfig.logToFile ? 'Store logs as file' : 'Store logs in database'}
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
