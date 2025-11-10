import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Minus } from 'lucide-react';
import { InputType } from '@/types/canvas';

const INPUT_TYPES: InputType[] = [
  'STRING', 'INT', 'FLOAT', 'BOOL', 'ARRAY', 'SELECT', 'MULTISELECT',
  'DATETIME', 'DATE', 'TIME', 'DURATION', 'FILE', 'JSON', 'URI', 'SECRET', 'YAML'
];

interface InputOutputEditorProps {
  nodeType: 'input' | 'output';
  config: any;
  onChange: (config: any) => void;
}

export default function InputOutputEditor({ nodeType, config, onChange }: InputOutputEditorProps) {
  const [id, setId] = useState(config.id || '');
  const [type, setType] = useState<string>(config.type || 'STRING');
  const [description, setDescription] = useState(config.description || '');
  const [displayName, setDisplayName] = useState(config.displayName || '');
  const [required, setRequired] = useState(config.required !== false);
  const [defaults, setDefaults] = useState(config.defaults !== undefined ? String(config.defaults) : '');
  const [value, setValue] = useState(config.value || '');
  const [min, setMin] = useState(config.min !== undefined ? String(config.min) : '');
  const [max, setMax] = useState(config.max !== undefined ? String(config.max) : '');
  const [validator, setValidator] = useState(config.validator || '');
  const [prefill, setPrefill] = useState(config.prefill || '');
  const [itemType, setItemType] = useState<string>(config.itemType || 'STRING');
  const [selectValues, setSelectValues] = useState<string[]>(config.values || []);
  const [newSelectValue, setNewSelectValue] = useState('');
  const [expression, setExpression] = useState(config.expression || '');
  const [allowCustomValue, setAllowCustomValue] = useState(config.allowCustomValue || false);
  const [autoSelectFirst, setAutoSelectFirst] = useState(config.autoSelectFirst || false);
  const [isRadio, setIsRadio] = useState(config.isRadio || false);
  const [fileExtensions, setFileExtensions] = useState<string[]>(config.allowedFileExtensions || []);
  const [newFileExtension, setNewFileExtension] = useState('');
  const [after, setAfter] = useState(config.after || '');
  const [before, setBefore] = useState(config.before || '');

  const buildConfig = () => {
    const baseConfig: any = {
      id,
      type,
      description,
      displayName,
      required,
    };

    if (nodeType === 'input' && defaults) {
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
    } else if (nodeType === 'output' && value) {
      baseConfig.value = value;
    }

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

    return baseConfig;
  };

  const handleChange = (updater: () => void) => {
    updater();
    setTimeout(() => onChange(buildConfig()), 0);
  };

  const addSelectValue = () => {
    if (newSelectValue.trim() && !selectValues.includes(newSelectValue.trim())) {
      const newValues = [...selectValues, newSelectValue.trim()];
      setSelectValues(newValues);
      setNewSelectValue('');
      onChange({ ...buildConfig(), values: newValues });
    }
  };

  const removeSelectValue = (valueToRemove: string) => {
    const newValues = selectValues.filter(v => v !== valueToRemove);
    setSelectValues(newValues);
    onChange({ ...buildConfig(), values: newValues });
  };

  const addFileExtension = () => {
    if (newFileExtension.trim() && !fileExtensions.includes(newFileExtension.trim())) {
      const newExts = [...fileExtensions, newFileExtension.trim()];
      setFileExtensions(newExts);
      setNewFileExtension('');
      onChange({ ...buildConfig(), allowedFileExtensions: newExts });
    }
  };

  const removeFileExtension = (extToRemove: string) => {
    const newExts = fileExtensions.filter(e => e !== extToRemove);
    setFileExtensions(newExts);
    onChange({ ...buildConfig(), allowedFileExtensions: newExts });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="input-type" className="text-xs font-semibold">
            Type <span className="text-destructive">*</span>
          </Label>
          <Select value={type} onValueChange={(val) => handleChange(() => setType(val))}>
            <SelectTrigger className="mt-1 text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INPUT_TYPES.map((inputType) => (
                <SelectItem key={inputType} value={inputType} className="text-xs">
                  {inputType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="input-id" className="text-xs font-semibold">
            ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="input-id"
            value={id}
            onChange={(e) => handleChange(() => setId(e.target.value))}
            onBlur={() => onChange(buildConfig())}
            className="mt-1 text-xs h-8"
            placeholder="order_id"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="input-displayName" className="text-xs">Display Name</Label>
        <Input
          id="input-displayName"
          value={displayName}
          onChange={(e) => handleChange(() => setDisplayName(e.target.value))}
          onBlur={() => onChange(buildConfig())}
          className="mt-1 text-xs h-8"
          placeholder="Order ID"
        />
      </div>

      <div>
        <Label htmlFor="input-description" className="text-xs">Description</Label>
        <Textarea
          id="input-description"
          value={description}
          onChange={(e) => handleChange(() => setDescription(e.target.value))}
          onBlur={() => onChange(buildConfig())}
          className="mt-1 text-xs"
          rows={2}
        />
      </div>

      {type === 'ARRAY' && (
        <div>
          <Label className="text-xs">Item Type</Label>
          <Select value={itemType} onValueChange={(val) => handleChange(() => setItemType(val))}>
            <SelectTrigger className="mt-1 text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STRING" className="text-xs">String</SelectItem>
              <SelectItem value="INT" className="text-xs">Integer</SelectItem>
              <SelectItem value="FLOAT" className="text-xs">Float</SelectItem>
              <SelectItem value="BOOL" className="text-xs">Boolean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(type === 'INT' || type === 'FLOAT') && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              value={min}
              onChange={(e) => handleChange(() => setMin(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Max</Label>
            <Input
              type="number"
              value={max}
              onChange={(e) => handleChange(() => setMax(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
            />
          </div>
        </div>
      )}

      {type === 'STRING' && (
        <>
          <div>
            <Label className="text-xs">Validator</Label>
            <Input
              value={validator}
              onChange={(e) => handleChange(() => setValidator(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
              placeholder="^[a-zA-Z]+$"
            />
          </div>
          <div>
            <Label className="text-xs">Prefill</Label>
            <Input
              value={prefill}
              onChange={(e) => handleChange(() => setPrefill(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
            />
          </div>
        </>
      )}

      {(type === 'SELECT' || type === 'MULTISELECT') && (
        <>
          <div>
            <Label className="text-xs">Values</Label>
            <div className="space-y-1 mt-1">
              {selectValues.map((val, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Input value={val} readOnly className="flex-1 text-xs h-7 bg-[#1F232D]" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSelectValue(val)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newSelectValue}
                  onChange={(e) => setNewSelectValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSelectValue();
                    }
                  }}
                  className="flex-1 text-xs h-7"
                  placeholder="VALUE_1"
                />
                <Button size="sm" onClick={addSelectValue} className="h-7 px-2 text-xs">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {type === 'FILE' && (
        <div>
          <Label className="text-xs">File Extensions</Label>
          <div className="space-y-1 mt-1">
            {fileExtensions.map((ext, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <Input value={ext} readOnly className="flex-1 text-xs h-7 bg-[#1F232D]" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFileExtension(ext)}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <Input
                value={newFileExtension}
                onChange={(e) => setNewFileExtension(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFileExtension();
                  }
                }}
                className="flex-1 text-xs h-7"
                placeholder=".txt"
              />
              <Button size="sm" onClick={addFileExtension} className="h-7 px-2 text-xs">
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {type === 'DATETIME' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">After</Label>
            <Input
              value={after}
              onChange={(e) => handleChange(() => setAfter(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Before</Label>
            <Input
              value={before}
              onChange={(e) => handleChange(() => setBefore(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
            />
          </div>
        </div>
      )}

      {nodeType === 'input' && (
        <div>
          <Label className="text-xs">Default</Label>
          {type === 'JSON' || type === 'YAML' ? (
            <Textarea
              value={defaults}
              onChange={(e) => handleChange(() => setDefaults(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 font-mono text-xs"
              rows={3}
            />
          ) : (
            <Input
              value={defaults}
              onChange={(e) => handleChange(() => setDefaults(e.target.value))}
              onBlur={() => onChange(buildConfig())}
              className="mt-1 text-xs h-8"
            />
          )}
        </div>
      )}

      {nodeType === 'output' && (
        <div>
          <Label className="text-xs">Value</Label>
          <Input
            value={value}
            onChange={(e) => handleChange(() => setValue(e.target.value))}
            onBlur={() => onChange(buildConfig())}
            className="mt-1 text-xs h-8"
            placeholder="{{ outputs.task1.value }}"
          />
        </div>
      )}

      <div className="flex items-center justify-between p-2 bg-[#1F232D] rounded-lg">
        <Label className="text-xs">Required</Label>
        <Switch
          checked={required}
          onCheckedChange={(val) => handleChange(() => setRequired(val))}
        />
      </div>
    </div>
  );
}

