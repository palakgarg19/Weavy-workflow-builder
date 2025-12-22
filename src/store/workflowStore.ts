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
} from 'reactflow';

// History Types
type HistoryState = {
  nodes: Node[];
  edges: Edge[];
};

type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  workflowName: string;
  currentWorkflowId: string | null;
  workflows: Array<{ id: string, name: string }>;
  isSaving: boolean;
  // History
  history: {
    past: HistoryState[];
    future: HistoryState[];
  };
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  updateNodeData: (id: string, data: any) => void;
  runNode: (nodeId: string) => Promise<void>;
  
  // Persistence
  fetchWorkflows: () => Promise<void>;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createNewWorkflow: () => void;
  loadSampleWorkflow: () => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  setWorkflowName: (name: string) => void;
  // Local JSON Persistence
  exportWorkflow: () => void;
  importWorkflow: (json: any) => { success: boolean, error?: string };
  // Helper to push history
  takeSnapshot: () => void;
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
      // Push current state to past
      const newPast = [...history.past, { nodes, edges }];
      if (newPast.length > MAX_HISTORY) newPast.shift();

      set({
          history: {
              past: newPast,
              future: [],
          }
      });
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
    
    // Check what type of changes we have
    const hasRemove = changes.some(c => c.type === 'remove');
    const hasDragEnd = changes.some(c => c.type === 'position' && c.dragging === false);
    
    // Take snapshot for remove immediately
    if (hasRemove) {
      get().takeSnapshot();
    }
    
    // Debounce drag end snapshots to avoid duplicates
    if (hasDragEnd) {
      if (dragEndTimer) {
        clearTimeout(dragEndTimer);
      }
      dragEndTimer = setTimeout(() => {
        get().takeSnapshot();
        dragEndTimer = null;
      }, 100); // 100ms debounce
    }

    // Apply the changes
    set({
      nodes: applyNodeChanges(changes, currentNodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const currentEdges = get().edges;
    const hasRemove = changes.some(c => c.type === 'remove');
    
    if (hasRemove) {
      get().takeSnapshot();
    }

    set({
      edges: applyEdgeChanges(changes, currentEdges),
    });
  },

  onConnect: (connection: Connection) => {
    // Take snapshot before adding edge
    get().takeSnapshot();
    
    const { nodes } = get();
    const sourceNode = nodes.find(n => n.id === connection.source);
    
    // Default purple for text/LLM, Teal for Image/Upload
    let stroke = '#c084fc'; 
    if (sourceNode?.type === 'imageNode' || sourceNode?.type === 'uploadNode') {
        stroke = '#2dd4bf';
    }

    set({
      edges: addEdge({ ...connection, style: { stroke, strokeWidth: 2 } }, get().edges),
    });
  },

  addNode: (node: Node) => {
    // Take snapshot before adding node
    get().takeSnapshot();
    
    set({
      nodes: [...get().nodes, node],
    });
  },

  updateNodeData: (id: string, data: any) => {
    // This fires on every key stroke for text. 
    // We should NOT snapshot here automatically or we flood the stack.
    // Rely on onBlur or explicit snapshots from components for data changes.
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

runNode: async (nodeId: string) => {
    const { nodes, edges, updateNodeData } = get();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    // 1. Set Loading State & Clear previous errors
    updateNodeData(nodeId, { isLoading: true, output: '', error: null, validationError: null });

    try {
        // 2. Gather Inputs (Text and Images) from previous nodes
        const incomingEdges = edges.filter((edge) => edge.target === nodeId);
        const inputNodes = incomingEdges.map((edge) => nodes.find((n) => n.id === edge.source)).filter(Boolean) as Node[];

        let textInput = "";
        const imageInputs: string[] = [];

        inputNodes.forEach((node) => {
            // Collect Text
            if (node.type === 'textNode' && node.data.text) {
                textInput += `${node.data.text} `;
            }
            // Collect Images (from UploadNode or previous ImageNode)
            if (node.type === 'uploadNode' && node.data.image) {
                imageInputs.push(node.data.image);
            }
            // Handle chained outputs
            if (node.data.output) {
                 // Check if output looks like a URL or Data URI (Image)
                 if (node.data.output.startsWith('http') || node.data.output.startsWith('data:')) {
                     imageInputs.push(node.data.output);
                 } else {
                     // Otherwise treat as text
                     textInput += ` ${node.data.output}`;
                 }
            }
        });

        // Add the node's own text prompt
        if (targetNode.data.text) textInput += ` ${targetNode.data.text}`;

        const userPrompt = textInput.trim();

        // VALIDATION: If no text input is provided AND no images are present, show error
        if (!userPrompt && imageInputs.length === 0) {
            updateNodeData(nodeId, { 
                isLoading: false, 
                validationError: 'Required input' 
            });
            return;
        }

        if (targetNode.type === 'imageNode') {
            
            let finalPromptForGen = textInput;

            // Step A: If we have input images, ask Gemini to describe them first
            if (imageInputs.length > 0) {
                try {
                    const response = await fetch('/api/gemini/run', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            model: 'gemini-2.5-flash', 
                            prompt: "Describe the visual style, subject, colors, and composition of this image in one detailed sentence.", 
                            images: imageInputs 
                        }),
                    });
                    const result = await response.json();
                    
                    if (!result.error && result.output) {
                        finalPromptForGen = `${textInput}. Based on image description: ${result.output}`;
                    }
                } catch (e) {
                    console.warn("Gemini description failed, using text only", e);
                }
            }

            if (!finalPromptForGen.trim()) {
                throw new Error("Could not generate a prompt. Please provide a text prompt or ensure the input image can be described.");
            }

            // Step C: Send to Pollinations (Free Image Gen)
            const randomSeed = Math.floor(Math.random() * 999999);
            const cleanPrompt = encodeURIComponent(finalPromptForGen.slice(0, 1000)); 
            const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?nologo=true&private=true&seed=${randomSeed}&width=1024&height=1024`;
            
            await new Promise(resolve => setTimeout(resolve, 1500));

            updateNodeData(nodeId, { 
                output: imageUrl,
                generatedDescription: imageInputs.length > 0 ? "Image-to-Image (via Description)" : "Text-to-Image",
                isLoading: false 
            });
            return;
        }

        if (targetNode.type === 'llmNode') {
            const model = targetNode.data.model || 'gemini-2.5-flash';
            const systemInstruction = targetNode.data.systemPrompt || undefined;
            const userPrompt = textInput.trim();

            const response = await fetch('/api/gemini/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    model, 
                    prompt: userPrompt, 
                    systemInstruction,
                    images: imageInputs 
                }),
            });
            
            const result = await response.json();
            
            if (result.error) {
                // Handle the Quota error specifically as discussed before
                if (result.error.includes('429')) throw new Error("Quota exceeded. Please check billing or try a different model.");
                throw new Error(result.error);
            }

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
        const response = await fetch('/api/workflows');
        const data = await response.json();
        if (Array.isArray(data)) {
            set({ workflows: data.map((w: any) => ({ id: w.id, name: w.name })) });
        }
    } catch (error) {
        console.error("Failed to fetch workflows", error);
    }
  },

  saveWorkflow: async () => {
    const { nodes, edges, workflowName, currentWorkflowId } = get();
    set({ isSaving: true });
    try {
        const method = currentWorkflowId ? 'PUT' : 'POST';
        const url = currentWorkflowId ? `/api/workflows/${currentWorkflowId}` : '/api/workflows';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: workflowName, nodes, edges }),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to save");
        
        if (!currentWorkflowId && data.id) {
            set({ currentWorkflowId: data.id });
        }
        
        // Refresh list
        await get().fetchWorkflows();
    } catch (error) {
        console.error(error);
        alert("Failed to save workflow");
    } finally {
        set({ isSaving: false });
    }
  },
  loadWorkflow: async (id: string) => {
    try {
        const response = await fetch(`/api/workflows/${id}`);
        const data = await response.json();
         set({ 
             currentWorkflowId: id,
             workflowName: data.name,
             nodes: data.nodes, 
             edges: data.edges,
             history: { past: [], future: [] }
         });
    } catch (error) {
        console.error(error);
        alert("Failed to load workflow");
    }
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

  loadSampleWorkflow: () => {
      // Pre-built Product Listing Generator
      const sampleNodes: Node[] = [
          { id: '1', type: 'textNode', position: { x: 100, y: 100 }, data: { text: "Product: Premium Leather Backpack\nFeatures: Waterproof, 15\" Laptop Sleeve, Anti-theft pocket." } },
          { id: '2', type: 'imageNode', position: { x: 100, y: 400 }, data: { image: null } },
          { id: '3', type: 'llmNode', position: { x: 500, y: 200 }, data: { model: 'gemini-1.5-flash', systemPrompt: 'You are a professional copywriter. Write a compelling product listing based on the description and image provided.', output: '' } }
      ];
      const sampleEdges: Edge[] = [
          { id: 'e1-3', source: '1', target: '3', style: { stroke: '#c084fc', strokeWidth: 2 } },
          { id: 'e2-3', source: '2', target: '3', style: { stroke: '#2dd4bf', strokeWidth: 2 } }
      ];
      set({ 
          nodes: sampleNodes, 
          edges: sampleEdges,
          history: { past: [], future: [] }
      });
  },

  exportWorkflow: () => {
    const { nodes, edges, workflowName } = get();
    const data = {
        name: workflowName,
        nodes,
        edges,
        version: "1.0",
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}_workflow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importWorkflow: (json: any) => {
    try {
        // Validation
        if (!json || typeof json !== 'object') throw new Error("Invalid JSON file");
        if (!Array.isArray(json.nodes)) throw new Error("Invalid workflow: Missing nodes");
        if (!Array.isArray(json.edges)) throw new Error("Invalid workflow: Missing edges");

        // Take snapshot before overwriting
        get().takeSnapshot();

        set({
            workflowName: json.name || "Imported Workflow",
            nodes: json.nodes,
            edges: json.edges,
            currentWorkflowId: null, // Reset ID as this is a local file
            history: { past: [], future: [] }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Import Error:", error);
        return { success: false, error: error.message };
    }
  }
}));
