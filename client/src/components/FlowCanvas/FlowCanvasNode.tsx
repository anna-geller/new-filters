import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { 
  Play, 
  Clock, 
  LogIn, 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  StickyNote 
} from 'lucide-react';

// Base node styles
const baseNodeClass = "px-2 py-1.5 rounded-lg border-2 shadow-lg min-w-[120px] transition-all hover:shadow-xl";
const labelClass = "text-xs font-semibold truncate";
const typeClass = "text-[10px] text-muted-foreground truncate mt-0.5";

// Task Node - Only tasks have input/output handles for workflow connections
export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#8408FF] ring-2 ring-[#8408FF]/30' : 'border-[#3A3F4F]'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#8408FF]" />
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 text-[#8408FF]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Task'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#8408FF]" />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

// Trigger Node - No handles, triggers are flow initiators
export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#10B981] ring-2 ring-[#10B981]/30' : 'border-[#3A3F4F]'}`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#10B981]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Trigger'}</div>
        </div>
      </div>
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

// Input Node - Flow element, no handles
export const InputNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/30' : 'border-[#3A3F4F]'}`}>
      <div className="flex items-center gap-2">
        <LogIn className="w-4 h-4 text-[#3B82F6]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Input'}</div>
        </div>
      </div>
    </div>
  );
});

InputNode.displayName = 'InputNode';

// Output Node - Flow element, no handles
export const OutputNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/30' : 'border-[#3A3F4F]'}`}>
      <div className="flex items-center gap-2">
        <LogOut className="w-4 h-4 text-[#F59E0B]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Output'}</div>
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';

// Error Handler Node - Has handles for ordering error handlers
export const ErrorNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#EF4444] ring-2 ring-[#EF4444]/30' : 'border-[#3A3F4F]'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#EF4444]" />
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Error Handler'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#EF4444]" />
    </div>
  );
});

ErrorNode.displayName = 'ErrorNode';

// Finally Node - Has handles for ordering finally tasks
export const FinallyNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30' : 'border-[#3A3F4F]'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#8B5CF6]" />
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Finally'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#8B5CF6]" />
    </div>
  );
});

FinallyNode.displayName = 'FinallyNode';

// Note Node - Styled as sticky note with customizable color, no handles, resizable
export const NoteNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  const noteText = config?.text || (data.label as string) || 'Double click to edit me';
  const color = config?.color || 'transparent';
  const width = config?.width || 120;
  const height = config?.height || 60;
  
  // Map colors to their darker gradient pairs for better white text contrast
  const getGradientColors = (baseColor: string): [string, string] => {
    const colorMap: Record<string, [string, string]> = {
      '#1E3A8A': ['#1E40AF', '#1E3A8A'], // Dark Blue
      '#7C2D12': ['#9A3412', '#7C2D12'], // Dark Orange
      '#166534': ['#15803D', '#166534'], // Dark Green
      '#6B21A8': ['#7E22CE', '#6B21A8'], // Dark Purple
      '#831843': ['#9F1239', '#831843'], // Dark Rose
      '#713F12': ['#854D0E', '#713F12'], // Dark Yellow/Brown
    };
    
    return colorMap[baseColor] || [baseColor, baseColor];
  };
  
  const [fromColor, toColor] = getGradientColors(color);
  const isTransparent = color === 'transparent';
  
  return (
    <>
      <NodeResizer
        color={selected ? '#8408FF' : '#3A3F4F'}
        isVisible={selected}
        minWidth={120}
        minHeight={60}
      />
      <div 
        className={`px-3 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl border-2 ${
          selected 
            ? 'border-[#8408FF] ring-2 ring-[#8408FF]/30' 
            : 'border-[#3A3F4F]'
        }`}
        style={{
          background: isTransparent 
            ? 'transparent' 
            : `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div className="flex items-start gap-1.5 h-full">
          <StickyNote className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isTransparent ? 'text-muted-foreground' : 'text-white'}`} />
          <div className="flex-1 min-w-0 overflow-auto">
            <div className={`text-xs font-medium whitespace-pre-wrap leading-snug break-words ${isTransparent ? 'text-foreground' : 'text-white'}`}>
              {noteText}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

NoteNode.displayName = 'NoteNode';
