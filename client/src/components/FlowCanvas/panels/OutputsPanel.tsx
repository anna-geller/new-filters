import { TaskMetadata } from '@/data/taskMetadata';
import { PlaygroundExecutionData } from '../FlowNodeSidePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Database, BarChart3, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Node } from '@xyflow/react';
import { getTaskMetadata } from '@/data/taskMetadata';

interface OutputsPanelProps {
  taskMetadata?: TaskMetadata;
  playgroundData: PlaygroundExecutionData | null;
  isRunning: boolean;
  isFlowOutput?: boolean;
  allNodes?: Node[];
}

export default function OutputsPanel({ taskMetadata, playgroundData, isRunning, isFlowOutput = false, allNodes = [] }: OutputsPanelProps) {
  const hasOutputs = taskMetadata?.outputs && taskMetadata.outputs.length > 0;
  const hasMetrics = taskMetadata?.metrics && taskMetadata.metrics.length > 0;
  const [debugExpression, setDebugExpression] = useState('');
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  // For flow outputs, collect all task outputs from all task nodes
  const collectFlowOutputs = () => {
    const outputs: Array<{ taskId: string; taskLabel: string; outputName: string; outputType: string; outputDescription: string; expression: string }> = [];
    
    allNodes.forEach(node => {
      if (node.type === 'task' || node.type === 'error' || node.type === 'finally') {
        const config = node.data.config as any || {};
        const pluginType = config.type || '';
        const metadata = getTaskMetadata(pluginType);
        
        // Use config.id if available, otherwise fall back to node.id
        const taskId = config.id || node.id;
        
        if (metadata?.outputs && metadata.outputs.length > 0) {
          metadata.outputs.forEach(output => {
            // Build proper Kestra expression for this output
            const expression = `{{ outputs.${taskId}.${output.name} }}`;
            
            outputs.push({
              taskId,
              taskLabel: node.data.label as string,
              outputName: output.name,
              outputType: output.type,
              outputDescription: output.description || '',
              expression,
            });
          });
        }
      }
    });
    
    return outputs;
  };

  const handleDragStart = (event: React.DragEvent, text: string) => {
    event.dataTransfer.setData('text/plain', text);
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleDebugExpression = () => {
    try {
      const expression = debugExpression.trim();
      if (!expression) {
        setDebugResult('Please enter an expression');
        return;
      }

      if (playgroundData?.outputs) {
        const cleanExpression = expression.replace(/\{\{|\}\}/g, '').trim();
        const parts = cleanExpression.split('.');
        
        let result: any = { outputs: playgroundData.outputs };
        for (const part of parts) {
          const arrayMatch = part.match(/^(\w+)\["(.+)"\]$/);
          if (arrayMatch) {
            const key = arrayMatch[1];
            const index = arrayMatch[2];
            result = result[key]?.[index];
          } else {
            result = result[part];
          }
          if (result === undefined) break;
        }
        
        setDebugResult(result !== undefined ? String(result) : 'undefined');
      } else {
        setDebugResult('No execution data available. Run the task first.');
      }
    } catch (error) {
      setDebugResult(`Error: ${error instanceof Error ? error.message : 'Invalid expression'}`);
    }
  };

  // Render simplified view for flow outputs
  if (isFlowOutput) {
    const flowOutputs = collectFlowOutputs();
    
    return (
      <div className="p-4 space-y-4" data-testid="outputs-panel-flow">
        {flowOutputs.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            No task outputs available. Add tasks to the flow to see their outputs here.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Drag any output below to map it to a flow output property
            </p>
            {flowOutputs.map((output, index) => (
              <div
                key={`${output.taskId}-${output.outputName}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, output.expression)}
                className="bg-[#262A35] border border-[#3A3F4F] rounded p-3 cursor-move hover:border-[#8408FF] transition-colors"
                data-testid={`flow-output-${output.taskId}-${output.outputName}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground mb-0.5">
                      {output.taskLabel} → {output.outputName}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {output.expression}
                    </div>
                  </div>
                  <span className="text-xs text-[#8408FF] font-mono whitespace-nowrap">{output.outputType}</span>
                </div>
                {output.outputDescription && (
                  <div className="text-xs text-muted-foreground">{output.outputDescription}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="outputs-panel">
      <Tabs defaultValue="outputs" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b border-[#3A3F4F] bg-transparent rounded-none h-auto p-0">
          <TabsTrigger 
            value="outputs" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8408FF] data-[state=active]:bg-transparent px-4 py-2"
            data-testid="tab-outputs"
          >
            <Database className="w-4 h-4 mr-2" />
            Outputs
          </TabsTrigger>
          <TabsTrigger 
            value="metrics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8408FF] data-[state=active]:bg-transparent px-4 py-2"
            data-testid="tab-metrics"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger 
            value="logs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8408FF] data-[state=active]:bg-transparent px-4 py-2"
            data-testid="tab-logs"
          >
            <FileText className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="outputs" className="mt-0 p-4 space-y-4">
            {isRunning && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#8408FF]" />
                <span className="ml-2 text-sm text-muted-foreground">Running task...</span>
              </div>
            )}

            {!isRunning && playgroundData?.outputs && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                    Execution Results
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(playgroundData.outputs).map(([key, value]) => (
                      <div 
                        key={key}
                        className="bg-[#262A35] border border-[#3A3F4F] rounded p-3"
                      >
                        <div className="text-xs font-medium text-foreground mb-1">{key}</div>
                        <div className="text-xs text-muted-foreground font-mono break-all">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Collapsible open={isDebugOpen} onOpenChange={setIsDebugOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:text-foreground/80">
                    <span>Debug Expression</span>
                    {isDebugOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-2">
                    <div>
                      <Textarea
                        value={debugExpression}
                        onChange={(e) => setDebugExpression(e.target.value)}
                        placeholder='{{ outputs.hello["value"] }}'
                        className="bg-[#262A35] border-[#3A3F4F] text-foreground font-mono text-sm min-h-[80px]"
                        data-testid="input-debug-expression"
                      />
                    </div>
                    <Button
                      onClick={handleDebugExpression}
                      className="w-full bg-[#8408FF] hover:bg-[#8613f7] text-white"
                      data-testid="button-debug-expression"
                    >
                      Debug Expression
                    </Button>
                    {debugResult !== null && (
                      <div className="bg-[#262A35] border border-[#3A3F4F] rounded p-3">
                        <div className="text-xs font-mono text-foreground break-all">
                          {debugResult}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

            {!isRunning && !playgroundData?.outputs && hasOutputs && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Output Schema
                </h4>
                <div className="space-y-2">
                  {taskMetadata?.outputs.map((output) => (
                    <div 
                      key={output.name}
                      className="bg-[#262A35] border border-[#3A3F4F] rounded p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{output.name}</span>
                        <span className="text-xs text-[#8408FF] font-mono">{output.type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{output.description}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Click "Run" to execute this task and see actual outputs
                  </p>
                </div>
              </div>
            )}

            {!isRunning && !playgroundData?.outputs && !hasOutputs && (
              <div className="text-xs text-muted-foreground text-center py-8">
                This task does not produce outputs.
              </div>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="mt-0 p-4 space-y-3">
            {isRunning && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#8408FF]" />
                <span className="ml-2 text-sm text-muted-foreground">Running task...</span>
              </div>
            )}

            {!isRunning && playgroundData?.metrics && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Execution Metrics
                </h4>
                <div className="space-y-2">
                  {Object.entries(playgroundData.metrics).map(([key, value]) => (
                    <div 
                      key={key}
                      className="bg-[#262A35] border border-[#3A3F4F] rounded p-3 flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-foreground">{key}</span>
                      <span className="text-xs text-muted-foreground font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isRunning && !playgroundData?.metrics && hasMetrics && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Metric Schema
                </h4>
                <div className="space-y-2">
                  {taskMetadata?.metrics.map((metric) => (
                    <div 
                      key={metric.name}
                      className="bg-[#262A35] border border-[#3A3F4F] rounded p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{metric.name}</span>
                        <span className="text-xs text-[#8408FF] font-mono capitalize">{metric.type}</span>
                      </div>
                      {metric.description && (
                        <div className="text-xs text-muted-foreground">{metric.description}</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Click "Run" to execute this task and see actual metrics
                  </p>
                </div>
              </div>
            )}

            {!isRunning && !playgroundData?.metrics && !hasMetrics && (
              <div className="text-xs text-muted-foreground text-center py-8">
                This task does not produce metrics.
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-0 p-4">
            {isRunning && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#8408FF]" />
                <span className="ml-2 text-sm text-muted-foreground">Running task...</span>
              </div>
            )}

            {!isRunning && playgroundData?.logs && playgroundData.logs.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Execution Logs
                </h4>
                <div className="bg-[#262A35] border border-[#3A3F4F] rounded p-3 font-mono text-xs space-y-1">
                  {playgroundData.logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isRunning && (!playgroundData?.logs || playgroundData.logs.length === 0) && (
              <div className="text-xs text-muted-foreground text-center py-8">
                {playgroundData ? 'No logs generated for this execution.' : 'Click "Run" to execute this task and see logs.'}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
