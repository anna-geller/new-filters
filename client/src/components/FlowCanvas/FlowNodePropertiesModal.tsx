import { useState } from 'react';
import { Node } from '@xyflow/react';
import yaml from 'js-yaml';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, X, Minus } from 'lucide-react';
import { InputType } from '@/types/canvas';

interface FlowNodePropertiesModalProps {
  node: Node;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  onDelete?: () => void;
}

const INPUT_TYPES: InputType[] = [
  'STRING', 'INT', 'FLOAT', 'BOOL', 'ARRAY', 'SELECT', 'MULTISELECT',
  'DATETIME', 'DATE', 'TIME', 'DURATION', 'FILE', 'JSON', 'URI', 'SECRET', 'YAML'
];

const STICKY_NOTE_COLORS = [
  { name: 'Tan', value: '#9B8B6B', gradient: 'from-[#9B8B6B] to-[#8B7355]' },
  { name: 'Yellow', value: '#FDE047', gradient: 'from-[#FDE047] to-[#FCD34D]' },
  { name: 'Pink', value: '#FDA4AF', gradient: 'from-[#FDA4AF] to-[#FB7185]' },
  { name: 'Blue', value: '#93C5FD', gradient: 'from-[#93C5FD] to-[#60A5FA]' },
  { name: 'Green', value: '#86EFAC', gradient: 'from-[#86EFAC] to-[#4ADE80]' },
  { name: 'Purple', value: '#C4B5FD', gradient: 'from-[#C4B5FD] to-[#A78BFA]' },
];

export default function FlowNodePropertiesModal({
  node,
  onClose,
  onSave,
  onDelete,
}: FlowNodePropertiesModalProps) {
  const config = node.data.config as any || {};
  
  // Note-specific
  const [noteText, setNoteText] = useState(config.text || '');
  const [noteColor, setNoteColor] = useState(config.color || STICKY_NOTE_COLORS[0].value);
  
  // Common input/output fields
  const [id, setId] = useState(config.id || '');
  const [type, setType] = useState<string>(config.type || (node.type === 'input' || node.type === 'output' ? 'STRING' : ''));
  const [description, setDescription] = useState(config.description || '');
  const [displayName, setDisplayName] = useState(config.displayName || '');
  const [required, setRequired] = useState(config.required !== false);
  const [defaults, setDefaults] = useState(config.defaults !== undefined ? String(config.defaults) : '');
  const [value, setValue] = useState(config.value || '');
  
  // Numeric fields (INT, FLOAT, DURATION)
  const [min, setMin] = useState(config.min !== undefined ? String(config.min) : '');
  const [max, setMax] = useState(config.max !== undefined ? String(config.max) : '');
  
  // String fields
  const [validator, setValidator] = useState(config.validator || '');
  const [prefill, setPrefill] = useState(config.prefill || '');
  
  // Array-specific
  const [itemType, setItemType] = useState<string>(config.itemType || 'STRING');
  
  // Select-specific
  const [selectValues, setSelectValues] = useState<string[]>(config.values || []);
  const [newSelectValue, setNewSelectValue] = useState('');
  const [expression, setExpression] = useState(config.expression || '');
  const [allowCustomValue, setAllowCustomValue] = useState(config.allowCustomValue || false);
  const [autoSelectFirst, setAutoSelectFirst] = useState(config.autoSelectFirst || false);
  const [isRadio, setIsRadio] = useState(config.isRadio || false);
  
  // File-specific
  const [fileExtensions, setFileExtensions] = useState<string[]>(config.allowedFileExtensions || []);
  const [newFileExtension, setNewFileExtension] = useState('');
  
  // DateTime-specific
  const [after, setAfter] = useState(config.after || '');
  const [before, setBefore] = useState(config.before || '');
  
  // Task/Trigger/Error/Finally fields - store as YAML
  const getCustomPropertiesYaml = () => {
    const filteredConfig = Object.entries(config)
      .filter(([key]) => !['id', 'type', 'description', 'displayName', 'required', 'defaults', 'value', 'itemType', 'values', 'allowedFileExtensions', 'text', 'color', 'min', 'max', 'validator', 'prefill', 'expression', 'allowCustomValue', 'autoSelectFirst', 'isRadio', 'after', 'before', 'width', 'height', 'tasks'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    try {
      return yaml.dump(filteredConfig, { indent: 2 });
    } catch (error) {
      return '';
    }
  };
  
  const [customPropertiesYaml, setCustomPropertiesYaml] = useState(getCustomPropertiesYaml());

  const handleSave = () => {
    if (node.type === 'note') {
      onSave({
        label: noteText.substring(0, 50) + (noteText.length > 50 ? '...' : ''),
        config: {
          text: noteText,
          color: noteColor,
          width: config.width || 240,
          height: config.height || 120,
        },
      });
      return;
    }

    if (node.type === 'input' || node.type === 'output') {
      try {
        const baseConfig: any = {
          id,
          type,
          description,
          displayName,
          required,
        };

        // Add defaults or value
        if (node.type === 'input' && defaults) {
          if (type === 'INT') {
            baseConfig.defaults = parseInt(defaults, 10);
          } else if (type === 'FLOAT') {
            baseConfig.defaults = parseFloat(defaults);
          } else if (type === 'BOOL') {
            baseConfig.defaults = defaults.toLowerCase() === 'true';
          } else if (type === 'ARRAY') {
            try {
              baseConfig.defaults = JSON.parse(defaults);
            } catch {
              baseConfig.defaults = defaults.split(',').map(v => v.trim());
            }
          } else {
            baseConfig.defaults = defaults;
          }
        } else if (node.type === 'output' && value) {
          baseConfig.value = value;
        }

        // Type-specific fields
        if (type === 'ARRAY' && itemType) {
          baseConfig.itemType = itemType;
        }
        
        if ((type === 'INT' || type === 'FLOAT' || type === 'DURATION') && (min || max)) {
          if (min) baseConfig.min = type === 'DURATION' ? min : Number(min);
          if (max) baseConfig.max = type === 'DURATION' ? max : Number(max);
        }
        
        if (type === 'STRING' && (validator || prefill)) {
          if (validator) baseConfig.validator = validator;
          if (prefill) baseConfig.prefill = prefill;
        }
        
        if ((type === 'SELECT' || type === 'MULTISELECT')) {
          if (selectValues.length > 0) baseConfig.values = selectValues;
          if (expression) baseConfig.expression = expression;
          if (prefill) baseConfig.prefill = prefill;
          if (type === 'SELECT') {
            if (allowCustomValue) baseConfig.allowCustomValue = allowCustomValue;
            if (autoSelectFirst) baseConfig.autoSelectFirst = autoSelectFirst;
            if (isRadio) baseConfig.isRadio = isRadio;
          }
        }
        
        if (type === 'FILE' && fileExtensions.length > 0) {
          baseConfig.allowedFileExtensions = fileExtensions;
        }
        
        if ((type === 'JSON' || type === 'YAML') && prefill) {
          baseConfig.prefill = prefill;
        }
        
        if (type === 'DATETIME' && (after || before)) {
          if (after) baseConfig.after = after;
          if (before) baseConfig.before = before;
        }

        // Use displayName or id for label
        const label = displayName || id;
        
        onSave({
          label,
          config: baseConfig,
        });
      } catch (error) {
        alert('Invalid configuration');
      }
      return;
    }

    // For task, trigger, error, finally nodes
    try {
      const parsedYaml = customPropertiesYaml.trim()
        ? yaml.load(customPropertiesYaml)
        : {};
      
      // Ensure customProps is an object
      const customProps = typeof parsedYaml === 'object' && parsedYaml !== null && !Array.isArray(parsedYaml) 
        ? parsedYaml as Record<string, any>
        : {};

      // Use displayName or id for label
      const label = displayName || id || (node.data.label as string);

      onSave({
        label,
        config: {
          id,
          type,
          description,
          displayName,
          ...customProps,
        },
      });
    } catch (error) {
      alert('Invalid YAML in custom properties');
    }
  };

  const addSelectValue = () => {
    if (newSelectValue.trim() && !selectValues.includes(newSelectValue.trim())) {
      setSelectValues([...selectValues, newSelectValue.trim()]);
      setNewSelectValue('');
    }
  };

  const removeSelectValue = (valueToRemove: string) => {
    setSelectValues(selectValues.filter(v => v !== valueToRemove));
  };

  const addFileExtension = () => {
    if (newFileExtension.trim() && !fileExtensions.includes(newFileExtension.trim())) {
      setFileExtensions([...fileExtensions, newFileExtension.trim()]);
      setNewFileExtension('');
    }
  };

  const removeFileExtension = (extToRemove: string) => {
    setFileExtensions(fileExtensions.filter(e => e !== extToRemove));
  };


  // Render sticky note editor
  if (node.type === 'note') {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-[#262A35] border-border">
          <DialogHeader>
            <DialogTitle>Edit Sticky Note</DialogTitle>
            <DialogDescription>
              Customize your note text and color
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="note-text">Note Content</Label>
              <Textarea
                id="note-text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mt-1 font-sans"
                rows={8}
                placeholder="Add your note here..."
              />
            </div>

            <div>
              <Label>Note Color</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {STICKY_NOTE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNoteColor(color.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all bg-gradient-to-br ${color.gradient} ${
                      noteColor === color.value ? 'border-white ring-2 ring-white/30' : 'border-transparent'
                    }`}
                  >
                    <span className="text-sm font-medium text-[#3A3F4F]">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Note
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#8408FF] hover:bg-[#8613f7]">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render input/output editor
  if (node.type === 'input' || node.type === 'output') {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#262A35] border-border">
          <DialogHeader>
            <DialogTitle>Edit {node.type === 'input' ? 'Input' : 'Output'} Configuration</DialogTitle>
            <DialogDescription>
              Configure all properties for this {node.type}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type and ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input-type" className="text-sm font-semibold">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INPUT_TYPES.map((inputType) => (
                      <SelectItem key={inputType} value={inputType}>
                        {inputType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="input-id" className="text-sm font-semibold">
                  ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="input-id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="mt-1"
                  placeholder="unique_identifier"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="input-displayName">Display Name</Label>
              <Input
                id="input-displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1"
                placeholder="A friendly display name"
              />
            </div>

            <div>
              <Label htmlFor="input-description">Description</Label>
              <Textarea
                id="input-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={2}
                placeholder="Optional description"
              />
            </div>

            {/* Type-specific fields */}
            {type === 'ARRAY' && (
              <div>
                <Label htmlFor="item-type">Item Type</Label>
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">String</SelectItem>
                    <SelectItem value="INT">Integer</SelectItem>
                    <SelectItem value="FLOAT">Float</SelectItem>
                    <SelectItem value="BOOL">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(type === 'INT' || type === 'FLOAT') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="input-min">Minimum</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button size="sm" variant="outline" onClick={() => setMin(String(Number(min || 0) - 1))} className="h-8 w-8 p-0">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      id="input-min"
                      type="number"
                      value={min}
                      onChange={(e) => setMin(e.target.value)}
                      className="flex-1"
                      placeholder="No minimum"
                    />
                    <Button size="sm" variant="outline" onClick={() => setMin(String(Number(min || 0) + 1))} className="h-8 w-8 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="input-max">Maximum</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button size="sm" variant="outline" onClick={() => setMax(String(Number(max || 0) - 1))} className="h-8 w-8 p-0">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      id="input-max"
                      type="number"
                      value={max}
                      onChange={(e) => setMax(e.target.value)}
                      className="flex-1"
                      placeholder="No maximum"
                    />
                    <Button size="sm" variant="outline" onClick={() => setMax(String(Number(max || 0) + 1))} className="h-8 w-8 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {type === 'DURATION' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration-min">Minimum</Label>
                  <Input
                    id="duration-min"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    className="mt-1"
                    placeholder="PT1M"
                  />
                </div>
                <div>
                  <Label htmlFor="duration-max">Maximum</Label>
                  <Input
                    id="duration-max"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    className="mt-1"
                    placeholder="PT1H"
                  />
                </div>
              </div>
            )}

            {type === 'STRING' && (
              <>
                <div>
                  <Label htmlFor="string-validator">Validator</Label>
                  <Input
                    id="string-validator"
                    value={validator}
                    onChange={(e) => setValidator(e.target.value)}
                    className="mt-1"
                    placeholder="^[a-zA-Z]+$"
                  />
                </div>
                <div>
                  <Label htmlFor="string-prefill">Prefill</Label>
                  <Input
                    id="string-prefill"
                    value={prefill}
                    onChange={(e) => setPrefill(e.target.value)}
                    className="mt-1"
                    placeholder="Default prefill value"
                  />
                </div>
              </>
            )}

            {(type === 'SELECT' || type === 'MULTISELECT') && (
              <>
                <div>
                  <Label>Values</Label>
                  <div className="space-y-2 mt-1">
                    {selectValues.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input value={val} readOnly className="flex-1 bg-[#1F232D]" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSelectValue(val)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSelectValue}
                        onChange={(e) => setNewSelectValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSelectValue();
                          }
                        }}
                        className="flex-1"
                        placeholder="VALUE_1"
                      />
                      <Button size="sm" onClick={addSelectValue}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="select-expression">Expression</Label>
                  <Input
                    id="select-expression"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="mt-1"
                    placeholder="{{ outputs.task1.values }}"
                  />
                </div>
                <div>
                  <Label htmlFor="select-prefill">Prefill</Label>
                  <Input
                    id="select-prefill"
                    value={prefill}
                    onChange={(e) => setPrefill(e.target.value)}
                    className="mt-1"
                    placeholder="Default value"
                  />
                </div>
                {type === 'SELECT' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#1F232D] rounded-lg">
                      <Label htmlFor="allow-custom">Allow Custom Value</Label>
                      <Switch
                        id="allow-custom"
                        checked={allowCustomValue}
                        onCheckedChange={setAllowCustomValue}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#1F232D] rounded-lg">
                      <Label htmlFor="auto-select">Auto Select First</Label>
                      <Switch
                        id="auto-select"
                        checked={autoSelectFirst}
                        onCheckedChange={setAutoSelectFirst}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#1F232D] rounded-lg">
                      <Label htmlFor="is-radio">Is Radio</Label>
                      <Switch
                        id="is-radio"
                        checked={isRadio}
                        onCheckedChange={setIsRadio}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {type === 'FILE' && (
              <div>
                <Label>Allowed File Extensions</Label>
                <div className="space-y-2 mt-1">
                  {fileExtensions.map((ext, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input value={ext} readOnly className="flex-1 bg-[#1F232D]" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFileExtension(ext)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newFileExtension}
                      onChange={(e) => setNewFileExtension(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFileExtension();
                        }
                      }}
                      className="flex-1"
                      placeholder=".txt"
                    />
                    <Button size="sm" onClick={addFileExtension}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {type === 'DATETIME' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="datetime-after">After</Label>
                  <Input
                    id="datetime-after"
                    value={after}
                    onChange={(e) => setAfter(e.target.value)}
                    className="mt-1"
                    placeholder="2024-01-01T00:00:00Z"
                  />
                </div>
                <div>
                  <Label htmlFor="datetime-before">Before</Label>
                  <Input
                    id="datetime-before"
                    value={before}
                    onChange={(e) => setBefore(e.target.value)}
                    className="mt-1"
                    placeholder="2024-12-31T23:59:59Z"
                  />
                </div>
              </div>
            )}

            {(type === 'JSON' || type === 'YAML') && (
              <div>
                <Label htmlFor="json-prefill">Prefill (Expression)</Label>
                <Input
                  id="json-prefill"
                  value={prefill}
                  onChange={(e) => setPrefill(e.target.value)}
                  className="mt-1"
                  placeholder="{{ outputs.task1.data }}"
                />
              </div>
            )}

            {/* Defaults or Value */}
            {node.type === 'input' && (
              <div>
                <Label htmlFor="input-defaults">
                  Default{' '}
                  {(type === 'JSON' || type === 'YAML' || type === 'INT' || type === 'FLOAT') ? '' : ''}
                </Label>
                {type === 'JSON' || type === 'YAML' ? (
                  <Textarea
                    id="input-defaults"
                    value={defaults}
                    onChange={(e) => setDefaults(e.target.value)}
                    className="mt-1 font-mono text-sm"
                    rows={4}
                    placeholder={type === 'JSON' ? '[{"key": "value"}]' : '- user: john\n  email: john@example.com'}
                  />
                ) : type === 'INT' || type === 'FLOAT' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Button size="sm" variant="outline" onClick={() => setDefaults(String(Number(defaults || 0) - 1))} className="h-10 w-10 p-0">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      id="input-defaults"
                      type="number"
                      value={defaults}
                      onChange={(e) => setDefaults(e.target.value)}
                      className="flex-1"
                      placeholder={type === 'INT' ? '42' : '3.14'}
                    />
                    <Button size="sm" variant="outline" onClick={() => setDefaults(String(Number(defaults || 0) + 1))} className="h-10 w-10 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Input
                    id="input-defaults"
                    value={defaults}
                    onChange={(e) => setDefaults(e.target.value)}
                    className="mt-1"
                    placeholder={
                      type === 'BOOL' ? 'true' :
                      type === 'DATETIME' ? '2024-01-01T12:00:00Z' :
                      type === 'DATE' ? '2024-01-01' :
                      type === 'TIME' ? '12:00:00' :
                      type === 'DURATION' ? 'PT5M' :
                      type === 'ARRAY' ? '[1, 2, 3]' :
                      'Default value'
                    }
                  />
                )}
              </div>
            )}

            {node.type === 'output' && (
              <div>
                <Label htmlFor="output-value">Value (Expression)</Label>
                <Input
                  id="output-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-1"
                  placeholder="{{ outputs.task1.value }}"
                />
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between p-3 bg-[#1F232D] rounded-lg">
              <Label htmlFor="input-required" className="text-sm">Required</Label>
              <Switch
                id="input-required"
                checked={required}
                onCheckedChange={setRequired}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-4">
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {node.type === 'input' ? 'Input' : 'Output'}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#8408FF] hover:bg-[#8613f7]">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default editor for task, trigger, error, finally
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#262A35] border-border">
        <DialogHeader>
          <DialogTitle>Edit Node Properties</DialogTitle>
          <DialogDescription>
            Configure the properties for this {node.type} node
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1F232D]">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="modal-id">ID</Label>
              <Input
                id="modal-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-1"
                placeholder="Unique identifier"
              />
            </div>

            <div>
              <Label htmlFor="modal-displayName">Display Name</Label>
              <Input
                id="modal-displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1"
                placeholder="Friendly display name"
              />
            </div>

            <div>
              <Label htmlFor="modal-type">Type</Label>
              <Input
                id="modal-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1"
                placeholder={
                  node.type === 'task'
                    ? 'io.kestra.plugin.core.log.Log'
                    : node.type === 'trigger'
                    ? 'io.kestra.plugin.core.trigger.Schedule'
                    : 'Type'
                }
              />
            </div>

            <div>
              <Label htmlFor="modal-description">Description</Label>
              <Textarea
                id="modal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={3}
                placeholder="Optional description"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="modal-custom">Custom Properties (YAML)</Label>
              <Textarea
                id="modal-custom"
                value={customPropertiesYaml}
                onChange={(e) => setCustomPropertiesYaml(e.target.value)}
                className="mt-1 font-mono text-xs"
                rows={15}
                placeholder={
                  node.type === 'trigger'
                    ? `id: schedule
type: io.kestra.plugin.core.trigger.Schedule
cron: "*/15 * * * *"`
                    : node.type === 'task' || node.type === 'error' || node.type === 'finally'
                    ? `id: hello_world
type: io.kestra.plugin.core.log.Log
message: Hello World!`
                    : `property: value`
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add any additional properties as valid YAML
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#8408FF] hover:bg-[#8613f7]">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
