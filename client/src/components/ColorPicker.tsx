import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

// Predefined color palette - darker colors for better white text contrast
const PRESET_COLORS = [
  'transparent', // Transparent
  '#1E3A8A', // Dark Blue
  '#7C2D12', // Dark Orange
  '#166534', // Dark Green
  '#6B21A8', // Dark Purple
  '#831843', // Dark Rose
  '#713F12', // Dark Yellow/Brown
  '#0F172A', // Slate
  '#1F2937', // Gray
  '#7F1D1D', // Dark Red
  '#064E3B', // Emerald
  '#4C1D95', // Violet
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export default function ColorPicker({ value, onChange, label = 'Color' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);
  const rgb = hexToRgb(tempColor);
  const [r, setR] = useState(rgb.r);
  const [g, setG] = useState(rgb.g);
  const [b, setB] = useState(rgb.b);

  useEffect(() => {
    if (value === 'transparent') {
      setTempColor('transparent');
      setR(0);
      setG(0);
      setB(0);
    } else {
      const newRgb = hexToRgb(value);
      setR(newRgb.r);
      setG(newRgb.g);
      setB(newRgb.b);
      setTempColor(value);
    }
  }, [value]);

  useEffect(() => {
    // If RGB values change from (0,0,0) while in transparent mode, exit transparent
    if (tempColor === 'transparent' && (r !== 0 || g !== 0 || b !== 0)) {
      setTempColor(rgbToHex(r, g, b));
    } else if (tempColor !== 'transparent') {
      setTempColor(rgbToHex(r, g, b));
    }
  }, [r, g, b, tempColor]);

  const handleOk = () => {
    onChange(tempColor);
    setIsOpen(false);
  };

  const handleClear = () => {
    setR(0);
    setG(0);
    setB(0);
    setTempColor('transparent');
  };

  const handlePresetClick = (color: string) => {
    if (color === 'transparent') {
      setR(0);
      setG(0);
      setB(0);
      setTempColor('transparent');
    } else {
      const newRgb = hexToRgb(color);
      setR(newRgb.r);
      setG(newRgb.g);
      setB(newRgb.b);
      setTempColor(color);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-full h-10 rounded border border-[#3A3F4F] flex items-center gap-2 px-3 hover:bg-[#262A35] transition-colors"
            data-testid="color-picker-trigger"
          >
            <div
              className={`w-6 h-6 rounded border border-[#3A3F4F] flex items-center justify-center ${value === 'transparent' ? 'bg-transparent' : ''}`}
              style={value !== 'transparent' ? { backgroundColor: value } : undefined}
            >
              {value === 'transparent' && (
                <span className="text-[8px] text-muted-foreground">None</span>
              )}
            </div>
            <span className="text-sm text-foreground font-mono">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-[#1F232D] border-[#3A3F4F]" data-testid="color-picker-popover">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-foreground">Environment Color</div>
            
            {/* Color Preview */}
            <div className="flex items-center gap-3">
              <div
                className={`w-16 h-16 rounded border-2 border-[#3A3F4F] ${tempColor === 'transparent' ? 'bg-transparent' : ''}`}
                style={tempColor !== 'transparent' ? { backgroundColor: tempColor } : undefined}
              >
                {tempColor === 'transparent' && (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">None</div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Current Color</div>
                <div className="font-mono text-sm text-foreground">{tempColor}</div>
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Preset Colors</div>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetClick(color)}
                    className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 ${
                      tempColor === color ? 'border-white ring-2 ring-white/30' : 'border-[#3A3F4F]'
                    } ${color === 'transparent' ? 'bg-transparent' : ''}`}
                    style={color !== 'transparent' ? { backgroundColor: color } : undefined}
                    data-testid={`preset-color-${color}`}
                  >
                    {color === 'transparent' && (
                      <div className="text-xs text-muted-foreground font-mono">None</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RGB Inputs */}
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">RGB Values</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="r-value" className="text-xs text-muted-foreground">R</Label>
                  <Input
                    id="r-value"
                    type="number"
                    min="0"
                    max="255"
                    value={r}
                    onChange={(e) => setR(parseInt(e.target.value) || 0)}
                    className="bg-[#262A35] border-[#3A3F4F] text-foreground h-8 text-xs"
                    data-testid="input-r"
                  />
                </div>
                <div>
                  <Label htmlFor="g-value" className="text-xs text-muted-foreground">G</Label>
                  <Input
                    id="g-value"
                    type="number"
                    min="0"
                    max="255"
                    value={g}
                    onChange={(e) => setG(parseInt(e.target.value) || 0)}
                    className="bg-[#262A35] border-[#3A3F4F] text-foreground h-8 text-xs"
                    data-testid="input-g"
                  />
                </div>
                <div>
                  <Label htmlFor="b-value" className="text-xs text-muted-foreground">B</Label>
                  <Input
                    id="b-value"
                    type="number"
                    min="0"
                    max="255"
                    value={b}
                    onChange={(e) => setB(parseInt(e.target.value) || 0)}
                    className="bg-[#262A35] border-[#3A3F4F] text-foreground h-8 text-xs"
                    data-testid="input-b"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hex-value" className="text-xs text-muted-foreground">HEX</Label>
                <Input
                  id="hex-value"
                  type="text"
                  value={tempColor}
                  onChange={(e) => {
                    const hex = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(hex)) {
                      const newRgb = hexToRgb(hex);
                      setR(newRgb.r);
                      setG(newRgb.g);
                      setB(newRgb.b);
                      setTempColor(hex);
                    }
                  }}
                  className="bg-[#262A35] border-[#3A3F4F] text-foreground font-mono h-8 text-xs"
                  data-testid="input-hex"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1 bg-[#262A35] border-[#3A3F4F] text-foreground hover:bg-[#1F232D]"
                data-testid="button-clear"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleOk}
                className="flex-1 bg-[#8408FF] hover:bg-[#8613f7] text-white"
                data-testid="button-ok"
              >
                OK
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
