import { Node, Edge } from '@xyflow/react';
import { X, Trash2, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTaskMetadata, TaskMetadata } from '@/data/taskMetadata';
import { useState, useMemo } from 'react';
import InputsPanel from './panels/InputsPanel';
import PropertiesPanel from './panels/PropertiesPanel';
import OutputsPanel from './panels/OutputsPanel';

export interface PlaygroundExecutionData {
  outputs?: Record<string, any>;
  metrics?: Record<string, any>;
  logs?: string[];
}

interface FlowNodeSidePanelProps {
  node: Node | null;
  allNodes: Node[];
  allEdges: Edge[];
  open: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  onDelete?: () => void;
  onPlaygroundRun?: (nodeId: string) => Promise<PlaygroundExecutionData>;
  onNodeSelect?: (nodeId: string) => void;
}

export default function FlowNodeSidePanel({
  node,
  allNodes,
  allEdges,
  open,
  onClose,
  onSave,
  onDelete,
  onPlaygroundRun,
  onNodeSelect
}: FlowNodeSidePanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [playgroundData, setPlaygroundData] = useState<PlaygroundExecutionData | null>(null);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);

  if (!node) return null;

  const config = node.data.config as any || {};
  const pluginType = config.type || '';
  const taskMetadata = getTaskMetadata(pluginType);

  const isTaskNode = node.type === 'task' || node.type === 'error' || node.type === 'finally';

  // Find previous and next tasks based on edges
  const { previousTask, nextTask } = useMemo(() => {
    const incomingEdges = allEdges.filter(edge => edge.target === node.id);
    const outgoingEdges = allEdges.filter(edge => edge.source === node.id);

    const prevTaskId = incomingEdges[0]?.source;
    const nextTaskId = outgoingEdges[0]?.target;

    const prevTask = prevTaskId ? allNodes.find(n => n.id === prevTaskId) : null;
    const nextTask = nextTaskId ? allNodes.find(n => n.id === nextTaskId) : null;

    return {
      previousTask: prevTask,
      nextTask: nextTask
    };
  }, [node.id, allNodes, allEdges]);

  const handleRunPlayground = async () => {
    if (!node || !onPlaygroundRun) return;
    
    setIsRunningPlayground(true);
    try {
      const data = await onPlaygroundRun(node.id);
      setPlaygroundData(data);
    } catch (error) {
      console.error('Playground execution failed:', error);
    } finally {
      setIsRunningPlayground(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ config: node.data.config });
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateTask = (taskNode: Node) => {
    if (onNodeSelect) {
      onNodeSelect(taskNode.id);
    }
  };

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent 
          side="right"
          hideCloseButton={true}
          className="w-[90vw] max-w-[1400px] p-0 bg-[#1F232D] border-l border-[#3A3F4F] flex flex-col relative group"
          data-testid="flow-node-side-panel"
        >
          {/* Previous Task Navigation - Left Edge */}
          {previousTask && onNodeSelect && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-20 w-8 rounded-l-none rounded-r-md bg-[#262A35]/80 hover:bg-[#8408FF]/20 border-r border-[#3A3F4F] opacity-0 group-hover:opacity-100 transition-opacity z-50"
                  onClick={() => handleNavigateTask(previousTask)}
                  data-testid="button-navigate-prev"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#262A35] border-[#3A3F4F]">
                <p className="text-xs">Previous: {previousTask.data.label || previousTask.id}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Next Task Navigation - Right Edge */}
          {nextTask && onNodeSelect && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-20 w-8 rounded-r-none rounded-l-md bg-[#262A35]/80 hover:bg-[#8408FF]/20 border-l border-[#3A3F4F] opacity-0 group-hover:opacity-100 transition-opacity z-50"
                  onClick={() => handleNavigateTask(nextTask)}
                  data-testid="button-navigate-next"
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-[#262A35] border-[#3A3F4F]">
                <p className="text-xs">Next: {nextTask.data.label || nextTask.id}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A3F4F] bg-[#262A35]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                {taskMetadata?.displayName || (node.data.label as string)}
              </span>
              {pluginType && (
                <span className="text-xs text-muted-foreground font-mono bg-[#1F232D] px-2 py-1 rounded">
                  {pluginType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isTaskNode && onPlaygroundRun && (
              <Button
                size="sm"
                onClick={handleRunPlayground}
                disabled={isRunningPlayground}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                data-testid="button-playground-run"
              >
                <Play className="w-4 h-4 mr-2" fill="currentColor" />
                {isRunningPlayground ? 'Running...' : 'Run'}
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#8408FF] hover:bg-[#8613f7] text-white"
              data-testid="button-save"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                data-testid="button-delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          </div>

          {/* Three-panel layout */}
          <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Inputs */}
          {isTaskNode && (
            <div className="w-1/3 border-r border-[#3A3F4F] flex flex-col">
              <div className="px-4 py-3 border-b border-[#3A3F4F] bg-[#262A35]">
                <h3 className="text-sm font-semibold text-foreground">Inputs</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Available data from connected tasks
                </p>
              </div>
              <ScrollArea className="flex-1">
                <InputsPanel 
                  nodeId={node.id}
                  allNodes={allNodes}
                  allEdges={allEdges}
                />
              </ScrollArea>
            </div>
          )}

          {/* Middle Panel - Properties */}
          <div className={`${isTaskNode ? 'w-1/3' : 'w-2/3'} border-r border-[#3A3F4F] flex flex-col`}>
            <div className="px-4 py-3 border-b border-[#3A3F4F] bg-[#262A35]">
              <h3 className="text-sm font-semibold text-foreground">Properties</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure task parameters
              </p>
            </div>
            <ScrollArea className="flex-1">
              <PropertiesPanel 
                node={node}
                taskMetadata={taskMetadata}
                onConfigChange={(newConfig: any) => {
                  node.data.config = { ...config, ...newConfig };
                }}
              />
            </ScrollArea>
          </div>

          {/* Right Panel - Outputs */}
          {isTaskNode && (
            <div className="w-1/3 flex flex-col">
              <div className="px-4 py-3 border-b border-[#3A3F4F] bg-[#262A35]">
                <h3 className="text-sm font-semibold text-foreground">Outputs</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Data produced by this task
                </p>
              </div>
              <ScrollArea className="flex-1">
                <OutputsPanel 
                  taskMetadata={taskMetadata}
                  playgroundData={playgroundData}
                  isRunning={isRunningPlayground}
                  taskId={config.id || node.data.label}
                />
              </ScrollArea>
            </div>
          )}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
