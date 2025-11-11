import { useState } from "react";
import { useLocation } from "wouter";
import { useHistoryState } from "wouter/use-browser-location";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { FlowCanvas } from "@/components/FlowCanvas";
import type { FlowProperties, FlowCanvasData } from "@/types/canvas";

interface FlowEditorPageProps {
  params?: {
    namespace?: string;
    flowId?: string;
  };
}

const TAB_TRIGGER_CLASSES =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground data-[state=active]:bg-[#2F3547] data-[state=active]:text-[#C4B5FD] data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_0_1px_rgba(196,181,253,0.25)]";

const YAML_PLACEHOLDER = `id: demo-flow
namespace: prod.team

tasks:
  - id: log
    type: io.kestra.plugin.core.log.Log
    message: "Hello from Kestra!"`;

interface FlowEditorRouteState {
  initialYaml?: string;
  flowId?: string;
  namespace?: string;
}

function renderPlaceholderCard(title: string, description: string) {
  return (
    <Card className="p-6 bg-[#262A35] border-border space-y-2">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

export default function FlowEditorPage({ params }: FlowEditorPageProps) {
  const [, setLocation] = useLocation();
  const historyState = useHistoryState<FlowEditorRouteState>();
  const initialFlowId = historyState?.flowId || params?.flowId || "";
  const initialNamespace = historyState?.namespace || params?.namespace || "";
  const initialYaml = historyState?.initialYaml || "";
  const defaultTab = initialYaml ? "code" : "canvas";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [codeValue, setCodeValue] = useState(initialYaml);
  const [flowProperties, setFlowProperties] = useState<FlowProperties>({
    id: initialFlowId,
    namespace: initialNamespace,
  });
  const [canvasData, setCanvasData] = useState<FlowCanvasData>({
    nodes: [],
    edges: [],
  });

  const handleSave = () => {
    console.log("Saving flow:", flowProperties, canvasData, codeValue);
    alert("Flow saved successfully! (This is a prototype - data is not persisted)");
  };

  const handleCancel = () => {
    setLocation("/flows");
  };

  const handleCanvasSave = (data: FlowCanvasData, properties: FlowProperties) => {
    setCanvasData(data);
    setFlowProperties(properties);
    console.log("Canvas saved:", data, properties);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="min-h-screen bg-[#1F232D] text-foreground"
    >
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-[#262A35]">
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="transition-colors hover:text-foreground flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    FLOWS
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground/80">
                    {params?.flowId ? "EDIT FLOW" : "CREATE NEW FLOW"}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {flowProperties.id || "New Flow"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-border/60 bg-[#1F232D] hover:bg-[#2F3341]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#8408FF] hover:bg-[#8613f7] text-white gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Flow
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-px w-full bg-border/60" />
              <TabsList className="flex justify-start gap-1 bg-transparent p-0 overflow-x-auto">
                <TabsTrigger value="code" className={TAB_TRIGGER_CLASSES}>
                  Code
                </TabsTrigger>
                <TabsTrigger value="no-code" className={TAB_TRIGGER_CLASSES}>
                  No-Code
                </TabsTrigger>
                <TabsTrigger value="canvas" className={TAB_TRIGGER_CLASSES}>
                  Canvas
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <TabsContent value="code" className="space-y-6 p-6">
            <Card className="border-border bg-[#262A35]">
              <div className="border-b border-border/70 px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Flow YAML</h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in the Kestra YAML for this flow. Changes are not saved automatically.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {flowProperties.namespace ? `${flowProperties.namespace} / ` : ""}
                  {flowProperties.id || "New Flow"}
                </span>
              </div>
              <div className="p-4">
                <Textarea
                  value={codeValue}
                  onChange={(event) => setCodeValue(event.target.value)}
                  placeholder={YAML_PLACEHOLDER}
                  className="min-h-[420px] font-mono text-sm bg-[#1F232D] border-border/60 focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="no-code" className="space-y-6 p-6">
            {renderPlaceholderCard(
              "No-Code Editor",
              "This tab will display a form-based interface for creating flows without writing code. Configure tasks, triggers, and other flow properties using intuitive forms."
            )}
          </TabsContent>

          <TabsContent value="canvas" className="mt-0 p-0 h-full">
            <FlowCanvas
              flowId={flowProperties.id}
              namespace={flowProperties.namespace}
              initialData={canvasData}
              initialProperties={flowProperties}
              onSave={handleCanvasSave}
            />
          </TabsContent>
        </main>
      </div>
    </Tabs>
  );
}
