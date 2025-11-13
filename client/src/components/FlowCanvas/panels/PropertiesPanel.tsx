import { Node } from '@xyflow/react';
import { TaskMetadata } from '@/data/taskMetadata';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  if (!taskMetadata || !taskMetadata.properties || taskMetadata.properties.length === 0) {
    return (
      <div className="p-4" data-testid="properties-panel">
        <div className="text-xs text-muted-foreground text-center py-8">
          No configurable properties for this task.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6" data-testid="properties-panel">
      {/* Task Description */}
      {taskMetadata.description && (
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

      {/* Properties */}
      <div className="space-y-4">
        {taskMetadata.properties.map((property) => {
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
                    {property.options.map((option) => (
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
        })}
      </div>
    </div>
  );
}
