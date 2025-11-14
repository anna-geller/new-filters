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
const baseNodeClass = "px-3 py-2 rounded-lg border-2 shadow-lg min-w-[140px] transition-all hover:shadow-xl";
const labelClass = "text-sm font-semibold truncate";
const typeClass = "text-xs text-muted-foreground truncate mt-0.5";

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
  const color = config?.color || '#9B8B6B';
  const width = config?.width || 200;
  const height = config?.height || 100;
  
  // Map colors to their gradient pairs
  const getGradientColors = (baseColor: string): [string, string] => {
    const colorMap: Record<string, [string, string]> = {
      '#9B8B6B': ['#A39771', '#9B8B6B'], // Tan
      '#FDE047': ['#FEF08A', '#FDE047'], // Yellow
      '#FDA4AF': ['#FECDD3', '#FDA4AF'], // Pink
      '#93C5FD': ['#BFDBFE', '#93C5FD'], // Blue
      '#86EFAC': ['#BBF7D0', '#86EFAC'], // Green
      '#C4B5FD': ['#DDD6FE', '#C4B5FD'], // Purple
    };
    
    return colorMap[baseColor] || [baseColor, baseColor];
  };
  
  const [fromColor, toColor] = getGradientColors(color);
  
  return (
    <>
      <NodeResizer
        color={selected ? '#ffffff' : '#7A6B55'}
        isVisible={selected}
        minWidth={200}
        minHeight={100}
      />
      <div 
        className={`px-4 py-3 rounded-lg shadow-lg transition-all hover:shadow-xl ${
          selected 
            ? 'border-2 border-white ring-2 ring-white/30' 
            : 'border-2 border-transparent'
        }`}
        style={{
          background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div className="flex items-start gap-2 h-full">
          <StickyNote className="w-4 h-4 text-[#3A3020] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0 overflow-auto">
            <div className="text-sm font-medium text-[#2A2010] whitespace-pre-wrap leading-relaxed break-words">
              {noteText}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

NoteNode.displayName = 'NoteNode';
