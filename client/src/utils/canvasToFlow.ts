import { FlowCanvasData, FlowProperties, FlowCanvasNode, FlowCanvasEdge } from '@/types/canvas';

/**
 * Convert canvas data to Kestra flow definition
 */
export function canvasToFlow(canvasData: FlowCanvasData, properties: FlowProperties): any {
  const flow: any = {
    id: properties.id,
    namespace: properties.namespace,
  };

  // Add optional basic properties
  if (properties.description) {
    flow.description = properties.description;
  }
  if (properties.disabled !== undefined) {
    flow.disabled = properties.disabled;
  }
  if (properties.deleted !== undefined) {
    flow.deleted = properties.deleted;
  }
  if (properties.workerGroup) {
    flow.workerGroup = properties.workerGroup;
  }
  if (properties.tenantId) {
    flow.tenantId = properties.tenantId;
  }
  if (properties.revision !== undefined) {
    flow.revision = properties.revision;
  }

  // Add concurrency configuration
  if (properties.concurrency) {
    flow.concurrency = properties.concurrency;
  }

  // Add inputs from canvas nodes and properties
  const inputNodes = canvasData.nodes.filter((node) => node.type === 'input');
  if (inputNodes.length > 0 || properties.inputs) {
    flow.inputs = properties.inputs || inputNodes.map((node) => node.data.config);
  }

  // Add outputs from canvas nodes and properties
  const outputNodes = canvasData.nodes.filter((node) => node.type === 'output');
  if (outputNodes.length > 0 || properties.outputs) {
    flow.outputs = properties.outputs || outputNodes.map((node) => node.data.config);
  }

  // Add tasks from canvas nodes
  const taskNodes = canvasData.nodes.filter((node) => node.type === 'task');
  if (taskNodes.length > 0) {
    flow.tasks = taskNodes.map((node) => {
      const task: any = {
        ...node.data.config,
      };
      
      // Add dependencies based on edges
      const incomingEdges = canvasData.edges.filter((edge) => edge.target === node.id);
      if (incomingEdges.length > 0) {
        task.dependsOn = incomingEdges.map((edge) => {
          const sourceNode = canvasData.nodes.find((n) => n.id === edge.source);
          const sourceConfig = sourceNode?.data.config as any;
          return sourceConfig?.id || edge.source;
        });
      }
      
      return task;
    });
  }

  // Add triggers from canvas nodes
  const triggerNodes = canvasData.nodes.filter((node) => node.type === 'trigger');
  if (triggerNodes.length > 0 || properties.triggers) {
    flow.triggers = properties.triggers || triggerNodes.map((node) => node.data.config);
  }

  // Add error handlers from canvas nodes
  const errorNodes = canvasData.nodes.filter((node) => node.type === 'error');
  if (errorNodes.length > 0 || properties.errors) {
    flow.errors = properties.errors || errorNodes.map((node) => node.data.config);
  }

  // Add finally tasks from canvas nodes
  const finallyNodes = canvasData.nodes.filter((node) => node.type === 'finally');
  if (finallyNodes.length > 0 || properties.finally) {
    flow.finally = properties.finally || finallyNodes.map((node) => node.data.config);
  }

  // Add listeners from canvas nodes
  const listenerNodes = canvasData.nodes.filter((node) => node.type === 'listener');
  if (listenerNodes.length > 0 || properties.listeners) {
    flow.listeners = properties.listeners || listenerNodes.map((node) => node.data.config);
  }

  // Add labels
  if (properties.labels && Object.keys(properties.labels).length > 0) {
    flow.labels = properties.labels;
  }

  // Add variables
  if (properties.variables && Object.keys(properties.variables).length > 0) {
    flow.variables = properties.variables;
  }

  // Add task defaults
  if (properties.taskDefaults && Object.keys(properties.taskDefaults).length > 0) {
    flow.taskDefaults = properties.taskDefaults;
  }

  // Add plugin defaults
  if (properties.pluginDefaults && Object.keys(properties.pluginDefaults).length > 0) {
    flow.pluginDefaults = properties.pluginDefaults;
  }

  // Add advanced configurations
  if (properties.afterExecution) {
    flow.afterExecution = properties.afterExecution;
  }

  if (properties.retry) {
    flow.retry = properties.retry;
  }

  if (properties.sla) {
    flow.sla = properties.sla;
  }

  return flow;
}

/**
 * Convert canvas data to JSON Canvas format (jsoncanvas.org)
 */
export function canvasToJsonCanvas(canvasData: FlowCanvasData): any {
  const jsonCanvas: any = {
    nodes: [],
    edges: [],
  };

  // Convert nodes
  canvasData.nodes.forEach((node) => {
    const jsonNode: any = {
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      width: node.width || 200,
      height: node.height || 100,
    };

    if (node.type === 'note') {
      // Note nodes are text nodes
      const noteConfig = node.data.config as any;
      jsonNode.type = 'text';
      jsonNode.text = noteConfig?.text || node.data.label;
    } else {
      // Other nodes are file nodes (referencing flow elements)
      const config = node.data.config as any;
      jsonNode.type = 'file';
      jsonNode.file = `${node.type}/${config?.id || node.id}`;
    }

    jsonCanvas.nodes.push(jsonNode);
  });

  // Convert edges
  canvasData.edges.forEach((edge) => {
    const jsonEdge: any = {
      id: edge.id,
      fromNode: edge.source,
      toNode: edge.target,
    };

    if (edge.sourceHandle) {
      jsonEdge.fromSide = edge.sourceHandle;
    }
    if (edge.targetHandle) {
      jsonEdge.toSide = edge.targetHandle;
    }

    jsonCanvas.edges.push(jsonEdge);
  });

  return jsonCanvas;
}

