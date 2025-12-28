import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  getOutgoers,
} from 'reactflow';

// --- Node Data Types ---

export interface BaseNodeData {
  label?: string;
  isLoading?: boolean;
  error?: string | null;
  validationError?: string | null;
  output?: string | null;
  activeSystemPrompt?: string; // Propagated system prompt
}

export interface TextNodeData extends BaseNodeData {
  text?: string;
}

export interface UploadNodeData extends BaseNodeData {
  image?: string | null;
  uploadError?: string | null;
}

export interface ImageNodeData extends BaseNodeData {
  selectedModel?: 'pollinations' | 'flux-schnell' | 'instruct-pix2pix';
  generatedDescription?: string;
}

export interface LLMNodeData extends BaseNodeData {
  imageInputCount?: number;
  model?: string;
  systemPrompt?: string;
}

export type WorkflowNodeData = TextNodeData | UploadNodeData | ImageNodeData | LLMNodeData;

// --- Discriminated Union for Nodes ---

export type TextNode = Node<TextNodeData, 'textNode'>;
export type UploadNode = Node<UploadNodeData, 'uploadNode'>;
export type ImageNode = Node<ImageNodeData, 'imageNode'>;
export type LLMNode = Node<LLMNodeData, 'llmNode'>;

export type WorkflowNode = TextNode | UploadNode | ImageNode | LLMNode;

// --- Store Types ---

type HistoryState = {
  nodes: WorkflowNode[];
  edges: Edge[];
};

type WorkflowState = {
  nodes: WorkflowNode[];
  edges: Edge[];
  workflowName: string;
  currentWorkflowId: string | null;
  workflows: Array<{ id: string, name: string }>;
  isSaving: boolean;
  history: {
    past: HistoryState[];
    future: HistoryState[];
  };

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: <T extends WorkflowNodeData>(id: string, data: Partial<T>) => void;
  runNode: (nodeId: string) => Promise<void>;

  fetchWorkflows: () => Promise<void>;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createNewWorkflow: () => void;

  undo: () => void;
  redo: () => void;
  setWorkflowName: (name: string) => void;
  exportWorkflow: () => void;
  importWorkflow: (json: any) => { success: boolean, error?: string };
  takeSnapshot: () => void;

  connectionStart: { nodeId: string, handleId: string, handleType: string } | null;
  connectionError: { nodeId: string, handleId: string, message: string } | null;
  setConnectionStart: (start: { nodeId: string, handleId: string, handleType: string } | null) => void;
  setConnectionError: (error: { nodeId: string, handleId: string, message: string } | null) => void;
  validateConnection: (sourceId: string, sourceHandle: string, targetId: string, targetHandle: string) => { isValid: boolean, message?: string };
};

// Max history length
const MAX_HISTORY = 20;

// Debounce timer for drag end snapshots
let dragEndTimer: NodeJS.Timeout | null = null;

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  workflowName: "My First Weavy",
  currentWorkflowId: null,
  workflows: [],
  isSaving: false,
  history: {
    past: [],
    future: [],
  },

  takeSnapshot: () => {
    const { nodes, edges, history } = get();
    const newPast = [...history.past, { nodes, edges }];
    if (newPast.length > MAX_HISTORY) newPast.shift();

    set({
      history: {
        past: newPast,
        future: [],
      }
    });
  },

  connectionStart: null,
  connectionError: null,

  setConnectionStart: (start) => set({ connectionStart: start }),
  setConnectionError: (error) => set({ connectionError: error }),

  validateConnection: (sourceId, sourceHandle, targetId, targetHandle) => {
    const { nodes, edges } = get();

    // 1. Prevent self-connections
    if (sourceId === targetId) {
      return { isValid: false, message: "Circular connections are not allowed" };
    }

    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return { isValid: false };
    }

    // 2. Cycle Detection
    const hasCycle = (node: Node, visited = new Set<string>()): boolean => {
      if (visited.has(node.id)) return false;
      visited.add(node.id);

      const outgoers = getOutgoers(node, nodes, edges);
      if (outgoers.some(outgoer => outgoer.id === sourceId)) {
        return true;
      }
      return outgoers.some(outgoer => hasCycle(outgoer, visited));
    };

    if (hasCycle(targetNode)) {
      return { isValid: false, message: "Circular connections are not allowed" };
    }

    // 3. Type Compatibility
    const isSourceImage = sourceNode.type === 'uploadNode' || sourceNode.type === 'imageNode';
    const isSourceText = sourceNode.type === 'textNode' || sourceNode.type === 'llmNode';

    if (targetHandle.endsWith('-out')) {
      return { isValid: false, message: "Wrong input type" };
    }

    const isTargetImageHandle = targetHandle.indexOf('image-in') !== -1;
    const isTargetTextHandle = targetHandle === 'prompt-in' ||
      targetHandle === 'system-prompt-in' ||
      targetHandle === 'text-in';

    if (isSourceImage && !isTargetImageHandle) return { isValid: false, message: "Wrong input type" };
    if (isSourceText && !isTargetTextHandle) return { isValid: false, message: "Wrong input type" };
    if (!isSourceImage && isTargetImageHandle) return { isValid: false, message: "Wrong input type" };
    if (!isSourceText && isTargetTextHandle) return { isValid: false, message: "Wrong input type" };

    return { isValid: true };
  },

  undo: () => {
    const { history, nodes, edges } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      history: {
        past: newPast,
        future: [{ nodes, edges }, ...history.future],
      }
    });
  },

  redo: () => {
    const { history, nodes, edges } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      history: {
        past: [...history.past, { nodes, edges }],
        future: newFuture,
      }
    });
  },

  setWorkflowName: (name: string) => {
    set({ workflowName: name });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const currentNodes = get().nodes;
    const hasRemove = changes.some(c => c.type === 'remove');
    const hasDragEnd = changes.some(c => c.type === 'position' && !c.dragging);

    if (hasRemove) {
      get().takeSnapshot();
    }

    if (hasDragEnd) {
      if (dragEndTimer) {
        clearTimeout(dragEndTimer);
      }
      dragEndTimer = setTimeout(() => {
        get().takeSnapshot();
        dragEndTimer = null;
      }, 100);
    }

    set({
      nodes: applyNodeChanges(changes, currentNodes) as WorkflowNode[],
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const hasRemove = changes.some(c => c.type === 'remove');
    if (hasRemove) {
      get().takeSnapshot();
    }
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const sourceNode = nodes.find(n => n.id === connection.source);

    // Use Teal for images, Purple for text
    let stroke = 'rgb(241,160,250)';
    if (sourceNode?.type === 'imageNode' || sourceNode?.type === 'uploadNode') {
      stroke = 'rgb(110,221,179)';
    }

    // Enforce 1:1 connection mapping for inputs
    const filteredEdges = edges.filter(edge => {
      return !(edge.target === connection.target && edge.targetHandle === connection.targetHandle);
    });

    set({
      edges: addEdge(
        { ...connection, style: { stroke, strokeWidth: 3 } },
        filteredEdges
      ),
    });
  },

  addNode: (node: WorkflowNode) => {
    get().takeSnapshot();
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: <T extends WorkflowNodeData>(id: string, data: Partial<T>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } } as WorkflowNode;
        }
        return node;
      }),
    });
  },

  runNode: async (nodeId: string) => {
    const { nodes, edges, updateNodeData } = get();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    updateNodeData(nodeId, { isLoading: true, output: '', error: null, validationError: null });

    try {
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      let textInput = "";
      let systemTextInput = "";
      const imageInputs: string[] = [];

      incomingEdges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (!sourceNode) return;

        if (edge.targetHandle === 'system-prompt-in') {
          if (sourceNode.type === 'textNode' && sourceNode.data.text) {
            systemTextInput += `${sourceNode.data.text} `;
          } else if (sourceNode.data.output) {
            systemTextInput += `${sourceNode.data.output} `;
          }
        } else {
          if (sourceNode.type === 'textNode' && sourceNode.data.text) {
            textInput += `${sourceNode.data.text} `;
          }
          if (sourceNode.type === 'uploadNode' && sourceNode.data.image) {
            imageInputs.push(sourceNode.data.image);
          }
          if (sourceNode.data.output) {
            if (sourceNode.data.output.startsWith('http') || sourceNode.data.output.startsWith('data:')) {
              imageInputs.push(sourceNode.data.output);
            } else {
              textInput += ` ${sourceNode.data.output}`;
            }
          }
        }
      });

      if (!systemTextInput.trim()) {
        const parentWithSystemPrompt = incomingEdges
          .map(edge => nodes.find(n => n.id === edge.source))
          .find(n => n?.data?.activeSystemPrompt);

        if (parentWithSystemPrompt) {
          systemTextInput = parentWithSystemPrompt.data.activeSystemPrompt || "";
        }
      }

      const activeSystemPrompt = systemTextInput.trim();
      updateNodeData(nodeId, { activeSystemPrompt });

      // Gather specific node prompt
      let nodeSpecificText = "";
      if (targetNode.type === 'textNode') {
        nodeSpecificText = targetNode.data.text || "";
      }

      const userPrompt = (textInput + " " + nodeSpecificText).trim();

      if (!userPrompt && imageInputs.length === 0) {
        updateNodeData(nodeId, {
          isLoading: false,
          validationError: 'Required input is missing.'
        });
        return;
      }

      // Strategy Pattern for Execution
      if (targetNode.type === 'imageNode') {
        const selectedModel = targetNode.data.selectedModel || 'pollinations';

        if (selectedModel === 'flux-schnell') {
          if (imageInputs.length > 0) throw new Error("FLUX.1-schnell is text-to-image only.");
          if (!userPrompt) throw new Error("Prompt is required.");

          const response = await fetch('/api/huggingface/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: "black-forest-labs/FLUX.1-schnell",
              prompt: userPrompt,
              task: "text-to-image"
            }),
          });

          if (!response.ok) throw new Error(`HuggingFace error: ${response.status}`);
          const blob = await response.blob();
          updateNodeData(nodeId, {
            output: URL.createObjectURL(blob),
            isLoading: false
          });
          return;
        }

        if (selectedModel === 'instruct-pix2pix') {
          throw new Error("Instruct-Pix2Pix is currently unavailable.");
        }

        // Default Pollinations strategy
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt)}?nologo=true&private=true&seed=${Math.floor(Math.random() * 999999)}&width=1024&height=1024`;
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateNodeData(nodeId, {
          output: imageUrl,
          isLoading: false
        });
        return;
      }

      if (targetNode.type === 'llmNode') {
        const response = await fetch('/api/gemini/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: targetNode.data.model || 'gemini-2.5-flash',
            prompt: userPrompt,
            systemInstruction: activeSystemPrompt || targetNode.data.systemPrompt,
            images: imageInputs
          }),
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);
        updateNodeData(nodeId, { output: result.output, isLoading: false });
      }

    } catch (error: any) {
      console.error("Run Node Error", error);
      updateNodeData(nodeId, {
        output: '',
        error: error.message || "Failed to run node",
        isLoading: false
      });
    }
  },

  fetchWorkflows: async () => {
    try {
      const resp = await fetch('/api/workflows');
      const data = await resp.json();
      if (resp.ok && Array.isArray(data)) {
        set({ workflows: data.map((w: any) => ({ id: w.id, name: w.name })) });
      }
    } catch (e) { console.error(e); }
  },

  saveWorkflow: async () => {
    const { nodes, edges, workflowName, currentWorkflowId } = get();
    set({ isSaving: true });
    try {
      const method = currentWorkflowId ? 'PUT' : 'POST';
      const url = currentWorkflowId ? `/api/workflows/${currentWorkflowId}` : '/api/workflows';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName, nodes, edges }),
      });
      const data = await resp.json();
      if (resp.ok && !currentWorkflowId && data.id) {
        set({ currentWorkflowId: data.id });
      }
      await get().fetchWorkflows();
    } catch (e) { alert("Failed to save workflow"); }
    finally { set({ isSaving: false }); }
  },

  loadWorkflow: async (id: string) => {
    try {
      const resp = await fetch(`/api/workflows/${id}`);
      const data = await resp.json();
      if (resp.ok) {
        set({
          currentWorkflowId: id,
          workflowName: data.name,
          nodes: data.nodes as WorkflowNode[],
          edges: data.edges,
          history: { past: [], future: [] }
        });
      }
    } catch (e) { alert("Failed to load workflow"); }
  },

  createNewWorkflow: () => {
    set({
      currentWorkflowId: null,
      workflowName: "Untitled Workflow",
      nodes: [],
      edges: [],
      history: { past: [], future: [] }
    });
  },

  exportWorkflow: () => {
    const { nodes, edges, workflowName } = get();
    const data = { name: workflowName, nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importWorkflow: (json: any) => {
    try {
      if (!Array.isArray(json.nodes) || !Array.isArray(json.edges)) throw new Error("Invalid format");
      get().takeSnapshot();
      set({
        workflowName: json.name || "Imported Workflow",
        nodes: json.nodes as WorkflowNode[],
        edges: json.edges,
        currentWorkflowId: null,
        history: { past: [], future: [] }
      });
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  }
}));
