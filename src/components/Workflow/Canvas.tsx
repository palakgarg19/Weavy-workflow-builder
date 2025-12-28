"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  ReactFlowProvider,
  Node,
  ConnectionMode,
  useReactFlow,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore, WorkflowNode } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import TextNode from './nodes/TextNode';
import ImageNode from './nodes/ImageNode';
import UploadNode from './nodes/UploadNode';
import LLMNode from './nodes/LLMNode';
import { generateId } from '@/lib/utils';
import { Undo2, Redo2, MousePointer2, Hand, ChevronDown } from 'lucide-react';
import { CustomConnectionLine } from './CustomConnectionLine';

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  uploadNode: UploadNode,
  llmNode: LLMNode,
};

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select');
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const nodes = useWorkflowStore(state => state.nodes);
  const edges = useWorkflowStore(state => state.edges);
  const onNodesChange = useWorkflowStore(state => state.onNodesChange);
  const onEdgesChange = useWorkflowStore(state => state.onEdgesChange);
  const onConnect = useWorkflowStore(state => state.onConnect);
  const addNode = useWorkflowStore(state => state.addNode);
  const undo = useWorkflowStore(state => state.undo);
  const redo = useWorkflowStore(state => state.redo);
  const history = useWorkflowStore(state => state.history);
  const setConnectionStart = useWorkflowStore(state => state.setConnectionStart);
  const setConnectionError = useWorkflowStore(state => state.setConnectionError);
  const storeValidateConnection = useWorkflowStore(state => state.validateConnection);
  const { zoomIn, zoomOut, fitView, zoomTo, getZoom } = useReactFlow();

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const updateZoomLevel = useCallback(() => {
    try {
      const zoom = getZoom();
      setZoomLevel(Math.round(zoom * 100));
    } catch (e) {
    }
  }, [getZoom]);

  useEffect(() => {
    if (reactFlowInstance) {
      updateZoomLevel();
    }
  }, [reactFlowInstance, updateZoomLevel]);

  const onMove = useCallback(() => {
    updateZoomLevel();
  }, [updateZoomLevel]);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleZoomTo = useCallback((level: number) => {
    zoomTo(level);
  }, [zoomTo]);

  const handleFitView = useCallback(() => {
    fitView();
  }, [fitView]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      if (isInput) return;

      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (event.key === 'y') {
          event.preventDefault();
          redo();
        } else if (event.key === '=' || event.key === '+') {
          event.preventDefault();
          handleZoomIn();
        } else if (event.key === '-') {
          event.preventDefault();
          handleZoomOut();
        } else if (event.key === '0') {
          event.preventDefault();
          handleZoomTo(1);
        } else if (event.key === '1') {
          event.preventDefault();
          handleFitView();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, zoomIn, zoomOut, zoomTo, fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let label = 'Node';
      if (type === 'textNode') label = 'Prompt';
      else if (type === 'imageNode') label = 'Image';
      else if (type === 'uploadNode') label = 'Upload';
      else if (type === 'llmNode') label = 'Any LLM';

      const newNode: WorkflowNode = {
        id: generateId(),
        type: type as any, // Cast because drop type is string
        position,
        data: {
          label,
          ...(type === 'textNode' ? { text: 'Hipster Sisyphus, lime dots overall suit, pushing a huge round rock up a hill. The rock is sprayed with the text "default prompt", bright grey background extreme side long shot, cinematic, fashion style, side view' } : {})
        } as any,
      };
      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onConnectStart = useCallback((_: any, { nodeId, handleId, handleType }: any) => {
    if (nodeId && handleId && handleType) {
      setConnectionStart({ nodeId, handleId, handleType });
    }
  }, [setConnectionStart]);

  const onConnectEnd = useCallback(() => {
    setConnectionStart(null);
    setConnectionError(null);
  }, [setConnectionStart, setConnectionError]);

  const isValidConnection = useCallback(
    (connection: any) => {
      const result = storeValidateConnection(
        connection.source,
        connection.sourceHandle || '',
        connection.target,
        connection.targetHandle || ''
      );
      return result.isValid;
    },
    [storeValidateConnection]
  );

  return (
    <div className="flex-1 h-full w-full bg-[#0a0a0a]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        connectionLineComponent={CustomConnectionLine}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onMove={onMove}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.01}
        maxZoom={3}
        deleteKeyCode={['Backspace', 'Delete']}
        panOnScroll={true}
        panOnDrag={true}
        selectionOnDrag={activeTool === 'select'}
      >
        <Background color="rgb(80, 80, 85)" gap={24} size={1.5} />
        <MiniMap
          style={{ height: 120 }}
          zoomable
          pannable
          className="!bg-[#141414] !border !border-[#333] !rounded-lg !shadow-xl"
          maskColor="rgba(0, 0, 0, 0.6)"
          nodeColor={(node) => {
            switch (node.type) {
              case 'textNode': return 'rgb(241, 160, 250)';
              case 'imageNode': return 'rgb(110, 221, 179)';
              case 'uploadNode': return '#ffffff';
              case 'llmNode': return '#a1a1aa';
              default: return '#505055';
            }
          }}
        />

        <div
          className="fixed bg-[rgb(33,33,38)] rounded-[8px] flex items-center z-[100]"
          style={{
            width: '237.2px',
            height: '44px',
            left: '642px',
            bottom: '16px'
          }}
        >
          <button
            onClick={() => setActiveTool('select')}
            className={cn(
              "ml-[10px] flex items-center justify-center rounded-[4px] transition-all duration-200 outline-none focus:outline-none ring-0 shadow-none border-none",
              activeTool === 'select'
                ? 'bg-[rgb(247,255,168)] text-black'
                : 'bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white'
            )}
            style={{ width: '28px', height: '28px' }}
            title="Select"
          >
            <MousePointer2 size={20} strokeWidth={1} className="shrink-0" />
          </button>

          <button
            onClick={() => setActiveTool('pan')}
            className={cn(
              "ml-[4px] flex items-center justify-center rounded-[4px] transition-all duration-200 outline-none focus:outline-none ring-0 shadow-none border-none",
              activeTool === 'pan'
                ? 'bg-[rgb(247,255,168)] text-black'
                : 'bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white'
            )}
            style={{ width: '28px', height: '28px' }}
            title="Pan"
          >
            <Hand size={20} strokeWidth={1} className="shrink-0" />
          </button>

          <div className="ml-[9px] w-[1px] h-[25px] bg-[rgb(53,53,57)]"></div>

          <button
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "ml-[9px] flex items-center justify-center rounded-[4px] transition-all duration-200 outline-none focus:outline-none ring-0 shadow-none border-none",
              canUndo
                ? 'bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white'
                : 'bg-transparent text-[#a1a1aa] cursor-not-allowed opacity-50'
            )}
            style={{ width: '28px', height: '28px' }}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={24} strokeWidth={1.25} className="shrink-0" />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              "ml-[4px] flex items-center justify-center rounded-[4px] transition-all duration-200 outline-none focus:outline-none ring-0 shadow-none border-none",
              canRedo
                ? 'bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white'
                : 'bg-transparent text-[#a1a1aa] cursor-not-allowed opacity-50'
            )}
            style={{ width: '28px', height: '28px' }}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={24} strokeWidth={1.25} className="shrink-0" />
          </button>

          <div className="ml-[9px] w-[1px] h-[25px] bg-[rgb(53,53,57)]"></div>

          {/* Zoom Dropdown */}
          <div className="relative ml-[8px]">
            <button
              onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
              className={cn(
                "text-white hover:bg-[rgb(53,53,57)] rounded-[4px] flex items-center justify-center transition-all outline-none focus:outline-none ring-0 shadow-none border-none",
                isZoomMenuOpen ? "bg-[rgb(53,53,57)]" : "bg-transparent"
              )}
              style={{
                width: '66px',
                height: '24px',
                fontSize: '12px',
                fontWeight: 400,
                fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif',
                gap: '12px',
                color: 'rgb(255,255,255)'
              }}
            >
              {zoomLevel}% <ChevronDown size={12} />
            </button>

            {isZoomMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[9997]"
                  onClick={() => setIsZoomMenuOpen(false)}
                />
                <div
                  className="absolute bottom-full mb-2 right-0 bg-[rgb(33,33,38)] rounded-[8px] z-[9998] py-[8px] flex flex-col items-center justify-center border border-[rgb(53,53,57)]"
                  style={{
                    width: '190.4px',
                    height: '112px',
                    fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif'
                  }}
                >
                  <button
                    onClick={() => { handleZoomIn(); setIsZoomMenuOpen(false); }}
                    className="px-[12px] flex items-center justify-between hover:bg-[rgb(53,53,57)] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                    style={{ width: '184px', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                  >
                    <span>Zoom in</span>
                    <span className="opacity-50" style={{ fontSize: '12px', color: 'rgb(255,255,255)' }}>Ctrl +</span>
                  </button>
                  <button
                    onClick={() => { handleZoomOut(); setIsZoomMenuOpen(false); }}
                    className="px-[12px] flex items-center justify-between hover:bg-[rgb(53,53,57)] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                    style={{ width: '184px', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                  >
                    <span>Zoom out</span>
                    <span className="opacity-50" style={{ fontSize: '12px', color: 'rgb(255,255,255)' }}>Ctrl -</span>
                  </button>
                  <button
                    onClick={() => { handleZoomTo(1); setIsZoomMenuOpen(false); }}
                    className="px-[12px] flex items-center justify-between hover:bg-[rgb(53,53,57)] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                    style={{ width: '184px', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                  >
                    <span>Zoom to 100%</span>
                    <span className="opacity-50" style={{ fontSize: '12px', color: 'rgb(255,255,255)' }}>Ctrl 0</span>
                  </button>
                  <button
                    onClick={() => { handleFitView(); setIsZoomMenuOpen(false); }}
                    className="px-[12px] flex items-center justify-between hover:bg-[rgb(53,53,57)] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                    style={{ width: '184px', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                  >
                    <span>Zoom to fit</span>
                    <span className="opacity-50" style={{ fontSize: '12px', color: 'rgb(255,255,255)' }}>Ctrl 1</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
