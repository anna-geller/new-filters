import { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  BackgroundVariant,
  NodeDimensionChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowCanvasNode, FlowCanvasEdge, FlowCanvasData, FlowProperties } from '@/types/canvas';
import FlowCanvasPalette from './FlowCanvasPalette';
import FlowPropertiesPanel from './FlowPropertiesPanel';
import FlowNodeSidePanel, { PlaygroundExecutionData } from './FlowNodeSidePanel';
import { TaskNode, TriggerNode, InputNode, OutputNode, ErrorNode, FinallyNode, NoteNode } from './FlowCanvasNode';

interface FlowCanvasProps {
  flowId?: string;
  namespace?: string;
  initialData?: FlowCanvasData;
  initialProperties?: FlowProperties;
  onSave?: (data: FlowCanvasData, properties: FlowProperties) => void;
}

export default function FlowCanvas({
  flowId,
  namespace,
  initialData,
  initialProperties,
  onSave,
}: FlowCanvasProps) {
  // Initialize nodes and edges from initial data
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    initialData?.nodes as Node[] || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialData?.edges as Edge[] || []
  );

  // Flow properties state
  const [flowProperties, setFlowProperties] = useState<FlowProperties>(
    initialProperties || {
      id: flowId || '',
      namespace: namespace || '',
    }
  );

  // Selected node for properties editing
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      task: TaskNode,
      trigger: TriggerNode,
      input: InputNode,
      output: OutputNode,
      error: ErrorNode,
      finally: FinallyNode,
      note: NoteNode,
    }),
    []
  );

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Handle node double-click
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to add new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const pluginType = event.dataTransfer.getData('application/reactflow-plugin');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: label || type,
          config: type === 'note' 
            ? { text: 'Double click to edit me. Guide', width: 240, height: 120 }
            : {
                id: `${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
                type: pluginType || '',
              },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  // Handle delete selected nodes/edges
  const onDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // Get selected node
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  // Get editing node
  const editingNode = useMemo(
    () => nodes.find((node) => node.id === editingNodeId),
    [nodes, editingNodeId]
  );

  // Handle node property update
  const handleNodeUpdate = useCallback(
    (nodeId: string, updatedData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updatedData,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  // Auto-save canvas data whenever nodes or edges change
  const handleAutoSave = useCallback(() => {
    if (onSave) {
      const canvasData: FlowCanvasData = {
        nodes: nodes as FlowCanvasNode[],
        edges: edges as FlowCanvasEdge[],
      };
      onSave(canvasData, flowProperties);
    }
  }, [nodes, edges, flowProperties, onSave]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        onDeleteSelected();
      }
    },
    [onDeleteSelected]
  );

  // Handle adding node from palette dropdown
  const handleAddNode = useCallback((type: string, label: string, pluginType: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 }, // Default position in viewport
      data: {
        label: label || type,
        config: type === 'note' 
          ? { text: 'Double click to edit me. Guide', width: 240, height: 120 }
          : {
              id: `${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
              type: pluginType || '',
            },
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  // Mock playground execution handler
  const handlePlaygroundRun = useCallback(async (nodeId: string): Promise<PlaygroundExecutionData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock execution data based on the node's task type
    const node = nodes.find(n => n.id === nodeId);
    const config = node?.data.config as any || {};
    const pluginType = config.type || '';

    // Return mock data based on task type
    if (pluginType === 'io.kestra.plugin.core.debug.Return') {
      return {
        outputs: {
          value: config.format || 'Hello there'
        },
        metrics: {
          duration: '145ms',
          length: 11
        },
        logs: [
          '[INFO] Task execution started',
          '[INFO] Rendering template: ' + (config.format || 'Hello there'),
          '[INFO] Task execution completed successfully'
        ]
      };
    } else if (pluginType === 'io.kestra.plugin.core.log.Log') {
      return {
        outputs: {},
        metrics: {
          duration: '12ms'
        },
        logs: [
          '[INFO] Task execution started',
          `[${config.level || 'INFO'}] ${config.message || 'Log message'}`,
          '[INFO] Task execution completed successfully'
        ]
      };
    }

    // Default mock data for other tasks
    return {
      outputs: {
        status: 'completed'
      },
      metrics: {
        duration: '200ms'
      },
      logs: [
        '[INFO] Task execution started',
        '[INFO] Task execution completed successfully'
      ]
    };
  }, [nodes]);

  return (
    <div 
      className="flex h-[calc(100vh-200px)] w-full bg-[#1F232D]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Left Palette */}
      <FlowCanvasPalette onAddNode={handleAddNode} />

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            // Handle dimension changes for note nodes
            changes.forEach((change) => {
              if (change.type === 'dimensions' && change.dimensions) {
                const node = nodes.find((n) => n.id === change.id);
                if (node && node.type === 'note') {
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === change.id
                        ? {
                            ...n,
                            data: {
                              ...n.data,
                              config: {
                                ...(n.data.config as any),
                                width: Math.round(change.dimensions!.width),
                                height: Math.round(change.dimensions!.height),
                              },
                            },
                          }
                        : n
                    )
                  );
                }
              }
            });
            onNodesChange(changes);
            handleAutoSave();
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            handleAutoSave();
          }}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          fitView
          className="bg-[#1F232D]"
        >
          <Background 
            color="#3A3F4F" 
            gap={16} 
            variant={BackgroundVariant.Dots}
          />
          <Controls />
          <MiniMap 
            className="bg-[#262A35] border-border"
            nodeColor={(node) => {
              switch (node.type) {
                case 'task':
                  return '#8408FF';
                case 'trigger':
                  return '#10B981';
                case 'input':
                  return '#3B82F6';
                case 'output':
                  return '#F59E0B';
                case 'error':
                  return '#EF4444';
                case 'finally':
                  return '#8B5CF6';
                case 'note':
                  return '#6B7280';
                default:
                  return '#9CA3AF';
              }
            }}
          />
        </ReactFlow>
      </div>

      {/* Right Properties Panel */}
      <FlowPropertiesPanel
        properties={flowProperties}
        selectedNode={selectedNode}
        onPropertiesChange={setFlowProperties}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={(nodeId) => {
          setNodes((nds) => nds.filter((n) => n.id !== nodeId));
          setSelectedNodeId(null);
          handleAutoSave();
        }}
      />

      {/* Node Properties Side Panel */}
      <FlowNodeSidePanel
        node={editingNode || null}
        allNodes={nodes}
        allEdges={edges}
        open={!!editingNode}
        onClose={() => setEditingNodeId(null)}
        onSave={(updatedData) => {
          if (editingNode) {
            handleNodeUpdate(editingNode.id, updatedData);
            handleAutoSave();
          }
        }}
        onDelete={editingNode ? () => {
          setNodes((nds) => nds.filter((n) => n.id !== editingNode.id));
          setEditingNodeId(null);
          handleAutoSave();
        } : undefined}
        onPlaygroundRun={handlePlaygroundRun}
      />
    </div>
  );
}

