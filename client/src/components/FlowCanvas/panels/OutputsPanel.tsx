import { TaskMetadata } from '@/data/taskMetadata';
import { PlaygroundExecutionData } from '../FlowNodeSidePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Database, BarChart3, FileText } from 'lucide-react';

interface OutputsPanelProps {
  taskMetadata?: TaskMetadata;
  playgroundData: PlaygroundExecutionData | null;
  isRunning: boolean;
}

export default function OutputsPanel({ taskMetadata, playgroundData, isRunning }: OutputsPanelProps) {
  const hasOutputs = taskMetadata?.outputs && taskMetadata.outputs.length > 0;
  const hasMetrics = taskMetadata?.metrics && taskMetadata.metrics.length > 0;

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
          <TabsContent value="outputs" className="mt-0 p-4 space-y-3">
            {isRunning && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#8408FF]" />
                <span className="ml-2 text-sm text-muted-foreground">Running task...</span>
              </div>
            )}

            {!isRunning && playgroundData?.outputs && (
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
