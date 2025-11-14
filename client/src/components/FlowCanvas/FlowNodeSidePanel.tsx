import { Node } from '@xyflow/react';
import { X, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  allEdges: any[];
  open: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  onDelete?: () => void;
  onPlaygroundRun?: (nodeId: string) => Promise<PlaygroundExecutionData>;
}

export default function FlowNodeSidePanel({
  node,
  allNodes,
  allEdges,
  open,
  onClose,
  onSave,
  onDelete,
  onPlaygroundRun
}: FlowNodeSidePanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [playgroundData, setPlaygroundData] = useState<PlaygroundExecutionData | null>(null);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);

  if (!node) return null;

  const config = node.data.config as any || {};
  const isOutputNode = node.type === 'output';
  
  // For Output nodes, use special metadata; otherwise use pluginType from config
  const pluginType = isOutputNode ? '__output_node__' : (config.type || '');
  const taskMetadata = getTaskMetadata(pluginType);

  const isTaskNode = node.type === 'task' || node.type === 'error' || node.type === 'finally';
  const showThreePanelLayout = isTaskNode || isOutputNode;
  const canRun = isTaskNode || isOutputNode;

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

  const handleClose = () => {
    // Auto-save config when closing the panel
    onSave({ config: node.data.config });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <SheetContent 
        side="right" 
        className="w-[90vw] max-w-[1400px] p-0 bg-[#1F232D] border-l border-[#3A3F4F] flex flex-col"
        data-testid="flow-node-side-panel"
      >
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
          
          <div className="flex items-center gap-6 mr-12">
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
            
            {canRun && onPlaygroundRun && (
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
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Inputs */}
          {showThreePanelLayout && (
            <div className="w-1/3 border-r border-[#3A3F4F] flex flex-col">
              <div className="px-4 py-3 border-b border-[#3A3F4F] bg-[#262A35]">
                <h3 className="text-sm font-semibold text-foreground">Inputs</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOutputNode ? 'Task outputs available for mapping' : 'Available data from connected tasks'}
                </p>
              </div>
              <ScrollArea className="flex-1">
                <InputsPanel 
                  nodeId={node.id}
                  allNodes={allNodes}
                  allEdges={allEdges}
                  showAllTasks={isOutputNode}
                />
              </ScrollArea>
            </div>
          )}

          {/* Middle Panel - Properties */}
          <div className={`${showThreePanelLayout ? 'w-1/3' : 'w-2/3'} border-r border-[#3A3F4F] flex flex-col`}>
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
                  // Always merge with latest config to avoid stale data
                  const currentConfig = node.data.config || {};
                  node.data.config = { ...currentConfig, ...newConfig };
                  // Auto-save for Output nodes to persist changes immediately
                  if (isOutputNode) {
                    onSave({ config: node.data.config });
                  }
                }}
              />
            </ScrollArea>
          </div>

          {/* Right Panel - Outputs */}
          {showThreePanelLayout && (
            <div className="w-1/3 flex flex-col">
              <div className="px-4 py-3 border-b border-[#3A3F4F] bg-[#262A35]">
                <h3 className="text-sm font-semibold text-foreground">
                  {isOutputNode ? 'Flow Outputs' : 'Outputs'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOutputNode ? 'Outputs produced by the flow' : 'Data produced by this task'}
                </p>
              </div>
              <ScrollArea className="flex-1">
                <OutputsPanel 
                  taskMetadata={taskMetadata}
                  playgroundData={playgroundData}
                  isRunning={isRunningPlayground}
                  isFlowOutput={isOutputNode}
                  allNodes={allNodes}
                />
              </ScrollArea>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
