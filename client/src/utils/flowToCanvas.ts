import { FlowCanvasData, FlowProperties, FlowCanvasNode, FlowCanvasEdge } from '@/types/canvas';

/**
 * Convert Kestra flow definition to canvas data
 * This creates a basic layout that can be customized by the user
 */
export function flowToCanvas(flow: any): { canvasData: FlowCanvasData; properties: FlowProperties } {
  const nodes: FlowCanvasNode[] = [];
  const edges: FlowCanvasEdge[] = [];
  
  let yOffset = 50;
  const xSpacing = 300;
  const ySpacing = 150;

  // Create input nodes
  if (flow.inputs && Array.isArray(flow.inputs)) {
    flow.inputs.forEach((input: any, index: number) => {
      nodes.push({
        id: `input-${input.id}`,
        type: 'input',
        position: { x: 50, y: yOffset + index * ySpacing },
        data: {
          label: input.id,
          config: input,
        },
      });
    });
    if (flow.inputs.length > 0) {
      yOffset += flow.inputs.length * ySpacing + 50;
    }
  }

  // Create trigger nodes
  if (flow.triggers && Array.isArray(flow.triggers)) {
    flow.triggers.forEach((trigger: any, index: number) => {
      nodes.push({
        id: `trigger-${trigger.id}`,
        type: 'trigger',
        position: { x: 50, y: yOffset + index * ySpacing },
        data: {
          label: trigger.id,
          config: trigger,
        },
      });
    });
    if (flow.triggers.length > 0) {
      yOffset += flow.triggers.length * ySpacing + 50;
    }
  }

  // Create task nodes in a horizontal layout
  if (flow.tasks && Array.isArray(flow.tasks)) {
    flow.tasks.forEach((task: any, index: number) => {
      const taskNode: FlowCanvasNode = {
        id: `task-${task.id}`,
        type: 'task',
        position: { 
          x: 50 + Math.floor(index / 3) * xSpacing, 
          y: yOffset + (index % 3) * ySpacing 
        },
        data: {
          label: task.id,
          config: task,
        },
      };
      nodes.push(taskNode);

      // Create edges for dependencies
      if (task.dependsOn) {
        const dependencies = Array.isArray(task.dependsOn) ? task.dependsOn : [task.dependsOn];
        dependencies.forEach((dep: string) => {
          edges.push({
            id: `edge-${dep}-${task.id}`,
            source: `task-${dep}`,
            target: `task-${task.id}`,
            type: 'smoothstep',
            animated: true,
          });
        });
      }
    });
    if (flow.tasks.length > 0) {
      yOffset += Math.ceil(flow.tasks.length / 3) * ySpacing + 50;
    }
  }

  // Create error handler nodes
  if (flow.errors && Array.isArray(flow.errors)) {
    flow.errors.forEach((error: any, index: number) => {
      nodes.push({
        id: `error-${error.id}`,
        type: 'error',
        position: { x: 50, y: yOffset + index * ySpacing },
        data: {
          label: error.id,
          config: error,
        },
      });
    });
    if (flow.errors.length > 0) {
      yOffset += flow.errors.length * ySpacing + 50;
    }
  }

  // Create finally nodes
  if (flow.finally && Array.isArray(flow.finally)) {
    flow.finally.forEach((finallyTask: any, index: number) => {
      nodes.push({
        id: `finally-${finallyTask.id}`,
        type: 'finally',
        position: { x: 50, y: yOffset + index * ySpacing },
        data: {
          label: finallyTask.id,
          config: finallyTask,
        },
      });
    });
    if (flow.finally.length > 0) {
      yOffset += flow.finally.length * ySpacing + 50;
    }
  }

  // Create listener nodes
  if (flow.listeners && Array.isArray(flow.listeners)) {
    flow.listeners.forEach((listener: any, index: number) => {
      nodes.push({
        id: `listener-${listener.id}`,
        type: 'listener',
        position: { x: 50, y: yOffset + index * ySpacing },
        data: {
          label: listener.id,
          config: listener,
        },
      });
    });
    if (flow.listeners.length > 0) {
      yOffset += flow.listeners.length * ySpacing + 50;
    }
  }

  // Create output nodes
  if (flow.outputs && Array.isArray(flow.outputs)) {
    flow.outputs.forEach((output: any, index: number) => {
      nodes.push({
        id: `output-${output.id}`,
        type: 'output',
        position: { x: 50, y: yOffset + index * ySpacing },
        data: {
          label: output.id,
          config: output,
        },
      });
    });
  }

  // Extract flow properties
  const properties: FlowProperties = {
    id: flow.id,
    namespace: flow.namespace,
    description: flow.description,
    disabled: flow.disabled,
    deleted: flow.deleted,
    revision: flow.revision,
    tenantId: flow.tenantId,
    concurrency: flow.concurrency,
    inputs: flow.inputs,
    outputs: flow.outputs,
    tasks: flow.tasks,
    triggers: flow.triggers,
    errors: flow.errors,
    finally: flow.finally,
    listeners: flow.listeners,
    labels: flow.labels,
    variables: flow.variables,
    taskDefaults: flow.taskDefaults,
    pluginDefaults: flow.pluginDefaults,
    afterExecution: flow.afterExecution,
    retry: flow.retry,
    sla: flow.sla,
    workerGroup: flow.workerGroup,
  };

  return {
    canvasData: { nodes, edges },
    properties,
  };
}

/**
 * Convert JSON Canvas format to canvas data
 */
export function jsonCanvasToCanvas(jsonCanvas: any): FlowCanvasData {
  const nodes: FlowCanvasNode[] = [];
  const edges: FlowCanvasEdge[] = [];

  // Convert nodes
  if (jsonCanvas.nodes && Array.isArray(jsonCanvas.nodes)) {
    jsonCanvas.nodes.forEach((jsonNode: any) => {
      if (jsonNode.type === 'text') {
        // Text nodes become note nodes
        nodes.push({
          id: jsonNode.id,
          type: 'note',
          position: { x: jsonNode.x, y: jsonNode.y },
          data: {
            label: 'Note',
            config: {
              text: jsonNode.text || '',
            },
          },
          width: jsonNode.width,
          height: jsonNode.height,
        });
      } else if (jsonNode.type === 'file' && jsonNode.file) {
        // File nodes reference flow elements
        const [nodeType, nodeId] = jsonNode.file.split('/');
        nodes.push({
          id: jsonNode.id,
          type: nodeType as any,
          position: { x: jsonNode.x, y: jsonNode.y },
          data: {
            label: nodeId,
            config: {
              id: nodeId,
              type: '',
            },
          },
          width: jsonNode.width,
          height: jsonNode.height,
        });
      }
    });
  }

  // Convert edges
  if (jsonCanvas.edges && Array.isArray(jsonCanvas.edges)) {
    jsonCanvas.edges.forEach((jsonEdge: any) => {
      edges.push({
        id: jsonEdge.id,
        source: jsonEdge.fromNode,
        target: jsonEdge.toNode,
        sourceHandle: jsonEdge.fromSide,
        targetHandle: jsonEdge.toSide,
        type: 'smoothstep',
        animated: true,
      });
    });
  }

  return { nodes, edges };
}

