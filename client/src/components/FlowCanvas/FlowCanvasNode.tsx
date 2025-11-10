import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Play, 
  Clock, 
  LogIn, 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  Ear,
  StickyNote 
} from 'lucide-react';

// Base node styles
const baseNodeClass = "px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] transition-all hover:shadow-xl";
const labelClass = "text-sm font-semibold truncate";
const typeClass = "text-xs text-muted-foreground truncate mt-1";

// Task Node
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

// Trigger Node
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
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#10B981]" />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

// Input Node
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
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#3B82F6]" />
    </div>
  );
});

InputNode.displayName = 'InputNode';

// Output Node
export const OutputNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/30' : 'border-[#3A3F4F]'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#F59E0B]" />
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

// Error Handler Node
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

// Finally Node
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
    </div>
  );
});

FinallyNode.displayName = 'FinallyNode';

// Listener Node
export const ListenerNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#262A35] ${selected ? 'border-[#06B6D4] ring-2 ring-[#06B6D4]/30' : 'border-[#3A3F4F]'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#06B6D4]" />
      <div className="flex items-center gap-2">
        <Ear className="w-4 h-4 text-[#06B6D4]" />
        <div className="flex-1 min-w-0">
          <div className={labelClass}>{data.label as string}</div>
          <div className={typeClass}>{config?.type || 'Listener'}</div>
        </div>
      </div>
    </div>
  );
});

ListenerNode.displayName = 'ListenerNode';

// Note Node
export const NoteNode = memo(({ data, selected }: NodeProps) => {
  const config = data.config as any;
  return (
    <div className={`${baseNodeClass} bg-[#2F3341] ${selected ? 'border-[#C4B5FD] ring-2 ring-[#C4B5FD]/30' : 'border-[#3A3F4F]'}`}>
      <div className="flex items-start gap-2">
        <StickyNote className="w-4 h-4 text-[#C4B5FD] mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-foreground whitespace-pre-wrap">{config?.text || 'Note'}</div>
        </div>
      </div>
    </div>
  );
});

NoteNode.displayName = 'NoteNode';

