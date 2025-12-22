"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  ReactFlowProvider,
  Node,
  Panel,
  ConnectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import TextNode from './nodes/TextNode';
import ImageNode from './nodes/ImageNode';
import UploadNode from './nodes/UploadNode';
import LLMNode from './nodes/LLMNode';
import { generateId } from '@/lib/utils';
import { Undo2, Redo2, MousePointer2, Hand, ZoomIn, ZoomOut, ChevronDown } from 'lucide-react';

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
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode,
    undo,
    redo,
    history
  } = useWorkflowStore();
  const { zoomIn, zoomOut, fitView, zoomTo, getZoom } = useReactFlow();

  // Check if undo/redo are available
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Update zoom level display
  const updateZoomLevel = useCallback(() => {
    try {
      const zoom = getZoom();
      setZoomLevel(Math.round(zoom * 100));
    } catch (e) {
      // getZoom might not be available immediately
    }
  }, [getZoom]);

  // Update zoom when React Flow is initialized and on any zoom change
  useEffect(() => {
    if (reactFlowInstance) {
      updateZoomLevel();
      
      // Listen to wheel events for pinch-to-zoom tracking
      const handleWheel = () => {
        // Small delay to let React Flow update zoom first
        setTimeout(updateZoomLevel, 10);
      };
      
      const viewport = reactFlowInstance.getViewport?.();
      if (viewport) {
        // Track any viewport changes
        const checkZoom = setInterval(updateZoomLevel, 100);
        
        // Also listen to wheel events
        window.addEventListener('wheel', handleWheel, { passive: true });
        
        return () => {
          clearInterval(checkZoom);
          window.removeEventListener('wheel', handleWheel);
        };
      }
    }
  }, [reactFlowInstance, updateZoomLevel]);

  // Wrapper functions that update zoom display after operations
  const handleZoomIn = useCallback(() => {
    zoomIn();
    setTimeout(updateZoomLevel, 50);
  }, [zoomIn, updateZoomLevel]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
    setTimeout(updateZoomLevel, 50);
  }, [zoomOut, updateZoomLevel]);

  const handleZoomTo = useCallback((level: number) => {
    zoomTo(level);
    setTimeout(updateZoomLevel, 50);
  }, [zoomTo, updateZoomLevel]);

  const handleFitView = useCallback(() => {
    fitView();
    setTimeout(updateZoomLevel, 50);
  }, [fitView, updateZoomLevel]);

  // Keyboard Shortcuts
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
      else if (type === 'llmNode') label = 'Run Any LLM';

      const newNode: Node = {
        id: generateId(),
        type,
        position,
        data: { 
            label,
            ...(type === 'textNode' ? { text: 'Hipster Sisyphus, lime dots overall suit, pushing a huge round rock up a hill. The rock is sprayed with the text "default prompt", bright grey background extreme side long shot, cinematic, fashion style, side view' } : {})
        },
      };
      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div className="flex-1 h-full w-full bg-[#0a0a0a]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        deleteKeyCode={['Backspace', 'Delete']}
        panOnScroll={true}
        panOnDrag={true}
        selectionOnDrag={activeTool === 'select'}
      >
        <Background color="rgb(80, 80, 85)" gap={24} size={1.5} />
        
        {/* Custom Bottom Toolbar (Floating Pill) */}
        <div 
            className="fixed bg-[rgb(33,33,38)] rounded-[8px] flex items-center z-[100]"
            style={{ 
                width: '237.2px', 
                height: '44px',
                left: '642px',
                bottom: '16px'
            }}
        >
                {/* Select Tool */}
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

                {/* Pan Tool */}
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

                {/* Vertical Divider */}
                <div className="ml-[9px] w-[1px] h-[25px] bg-[rgb(53,53,57)]"></div>

                {/* Undo */}
                <button 
                    onClick={undo} 
                    disabled={!canUndo}
                    className={cn(
                        "ml-[9px] flex items-center justify-center rounded-[4px] transition-all duration-200 outline-none focus:outline-none ring-0 shadow-none border-none",
                        canUndo 
                            ? 'bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white' 
                            : 'bg-transparent text-[#52525b] cursor-not-allowed opacity-50'
                    )}
                    style={{ width: '28px', height: '28px' }}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={20} strokeWidth={1} className="shrink-0" />
                </button>

                {/* Redo */}
                 <button 
                    onClick={redo} 
                    disabled={!canRedo}
                    className={cn(
                        "ml-[4px] flex items-center justify-center rounded-[4px] transition-all duration-200 outline-none focus:outline-none ring-0 shadow-none border-none",
                        canRedo 
                            ? 'bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white' 
                            : 'bg-transparent text-[#52525b] cursor-not-allowed opacity-50'
                    )}
                    style={{ width: '28px', height: '28px' }}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 size={20} strokeWidth={1} className="shrink-0" />
                </button>

                {/* Vertical Divider */}
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
