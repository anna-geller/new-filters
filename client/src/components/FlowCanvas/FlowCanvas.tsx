import { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowCanvasNode, FlowCanvasEdge, FlowCanvasData, FlowProperties } from '@/types/canvas';
import FlowCanvasPalette from './FlowCanvasPalette';
import FlowPropertiesPanel from './FlowPropertiesPanel';
import FlowNodePropertiesModal from './FlowNodePropertiesModal';
import { TaskNode, TriggerNode, InputNode, OutputNode, ErrorNode, FinallyNode, ListenerNode, NoteNode } from './FlowCanvasNode';

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
      listener: ListenerNode,
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
          config: {
            id: `${type}_${Date.now()}`,
            type: '',
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  // Handle save
  const handleSave = useCallback(() => {
    const canvasData: FlowCanvasData = {
      nodes: nodes as FlowCanvasNode[],
      edges: edges as FlowCanvasEdge[],
    };

    if (onSave) {
      onSave(canvasData, flowProperties);
    }
  }, [nodes, edges, flowProperties, onSave]);

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

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        onDeleteSelected();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    },
    [onDeleteSelected, handleSave]
  );

  return (
    <div 
      className="flex h-[calc(100vh-200px)] w-full bg-[#1F232D]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Left Palette */}
      <FlowCanvasPalette />

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#1F232D]"
        >
          <Background 
            color="#3A3F4F" 
            gap={16} 
            variant={BackgroundVariant.Dots}
          />
          <Controls 
            className="bg-[#262A35] border-border"
          />
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
                case 'listener':
                  return '#06B6D4';
                case 'note':
                  return '#6B7280';
                default:
                  return '#9CA3AF';
              }
            }}
          />
          <Panel position="top-right" className="bg-[#262A35] border border-border rounded-md p-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#8408FF] hover:bg-[#8613f7] text-white rounded-md text-sm font-medium transition-colors"
            >
              Save Canvas
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Properties Panel */}
      <FlowPropertiesPanel
        properties={flowProperties}
        selectedNode={selectedNode}
        onPropertiesChange={setFlowProperties}
        onNodeUpdate={handleNodeUpdate}
      />

      {/* Node Properties Modal */}
      {editingNode && (
        <FlowNodePropertiesModal
          node={editingNode}
          onClose={() => setEditingNodeId(null)}
          onSave={(updatedData) => {
            handleNodeUpdate(editingNode.id, updatedData);
            setEditingNodeId(null);
          }}
        />
      )}
    </div>
  );
}

