import { Node, Edge } from '@xyflow/react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_EXECUTION_CONTEXT, getTaskMetadata } from '@/data/taskMetadata';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface InputsPanelProps {
  nodeId: string;
  allNodes: Node[];
  allEdges: Edge[];
}

export default function InputsPanel({ nodeId, allNodes, allEdges }: InputsPanelProps) {
  const { toast } = useToast();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(`{{ ${path} }}`);
    setCopiedPath(path);
    toast({
      title: 'Copied to clipboard',
      description: `{{ ${path} }}`,
      duration: 2000,
    });
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.dataTransfer.setData('text/plain', `{{ ${path} }}`);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const connectedInputs = allEdges
    .filter(edge => edge.target === nodeId)
    .map(edge => {
      const sourceNode = allNodes.find(n => n.id === edge.source);
      if (!sourceNode) return null;
      
      const config = sourceNode.data.config as any || {};
      const taskId = config.id || sourceNode.data.label;
      const pluginType = config.type || '';
      
      const taskMetadata = getTaskMetadata(pluginType);
      const taskOutputs = taskMetadata?.outputs || [];
      
      const outputs = taskOutputs.map(output => ({
        name: output.name,
        type: output.type,
        path: `outputs.${taskId}.${output.name}`
      }));
      
      return {
        taskId,
        label: sourceNode.data.label as string,
        nodeType: sourceNode.type,
        outputs,
        hasOutputs: outputs.length > 0
      };
    })
    .filter(Boolean);

  const executionContext = [
    { name: 'execution.id', type: 'String', value: DEFAULT_EXECUTION_CONTEXT.id },
    { name: 'execution.startDate', type: 'DateTime', value: DEFAULT_EXECUTION_CONTEXT.startDate },
    { name: 'flow.id', type: 'String', value: DEFAULT_EXECUTION_CONTEXT.flowId },
    { name: 'flow.namespace', type: 'String', value: DEFAULT_EXECUTION_CONTEXT.namespace },
  ];

  return (
    <div className="p-4 space-y-6" data-testid="inputs-panel">
      {/* Connected Task Outputs */}
      {connectedInputs.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Task Outputs
          </h4>
          <div className="space-y-4">
            {connectedInputs.map((input: any) => (
              <div key={input.taskId}>
                <div className="text-xs font-medium text-foreground mb-2">
                  {input.label}
                </div>
                {input.hasOutputs ? (
                  <div className="space-y-2">
                    {input.outputs.map((output: any) => (
                      <div 
                        key={output.path}
                        draggable
                        onDragStart={(e) => handleDragStart(e, output.path)}
                        className="group relative bg-[#262A35] border border-[#3A3F4F] rounded p-2 hover:border-[#8408FF] transition-colors cursor-move"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono text-foreground truncate">
                              {output.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {output.type}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                              {`{{ ${output.path} }}`}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCopy(output.path)}
                            data-testid={`button-copy-${output.path}`}
                          >
                            {copiedPath === output.path ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic bg-[#262A35] border border-[#3A3F4F] rounded p-2">
                    No outputs available
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Context */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
          Execution Context
        </h4>
        <div className="space-y-2">
          {executionContext.map((item) => (
            <div 
              key={item.name}
              draggable
              onDragStart={(e) => handleDragStart(e, item.name)}
              className="group relative bg-[#262A35] border border-[#3A3F4F] rounded p-2 hover:border-[#8408FF] transition-colors cursor-move"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-foreground truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.type}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                    {item.value}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(item.name)}
                  data-testid={`button-copy-${item.name}`}
                >
                  {copiedPath === item.name ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {connectedInputs.length === 0 && (
        <div className="text-xs text-muted-foreground text-center py-8">
          No connected tasks. Connect tasks to see their outputs here.
        </div>
      )}
    </div>
  );
}
