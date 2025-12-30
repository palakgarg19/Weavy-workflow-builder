import React, { useState, useRef, useEffect } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';
import { ChevronRight, ChevronDown, Loader2, Plus, MoveRight } from 'lucide-react';
import { useWorkflowStore, LLMNodeData } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { BaseNodeMenu, useBaseNodeMenu } from '../shared/BaseNodeMenu';
import { ValidationHandle } from '../shared/ValidationHandle';

/**
 * LLMModelSelectionSubmenu - Handles model selection for LLMNode.
 */
const LLMModelSelectionSubmenu = () => {
    const { closeMenu } = useBaseNodeMenu();
    const [showModelSubmenu, setShowModelSubmenu] = useState(false);

    return (
        <div className="relative w-full px-[3px]">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowModelSubmenu(!showModelSubmenu);
                }}
                className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
            >
                <span>Select Model</span>
                {showModelSubmenu ? <ChevronDown size={12} className="opacity-50" /> : <ChevronRight size={12} className="opacity-50" />}
            </button>

            {/* Model Submenu */}
            {showModelSubmenu && (
                <div className="w-full flex flex-col items-center justify-center mt-1">
                    <button
                        onClick={() => {
                            setShowModelSubmenu(false);
                            closeMenu();
                        }}
                        className="px-[12px] pl-[24px] w-full flex items-center justify-start hover:bg-[rgb(53,53,57)] transition-colors bg-[rgb(53,53,57)] border-none outline-none shadow-none ring-0 rounded-[4px]"
                        style={{ width: '100%', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                    >
                        <span>google/gemini-2.5-flash</span>
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * LLMNode - Processes text and image inputs through Google Gemini models.
 */
export default function LLMNode({ id, data, selected }: { id: string, data: LLMNodeData, selected: boolean }) {
    const updateNodeData = useWorkflowStore(state => state.updateNodeData);
    const runNode = useWorkflowStore(state => state.runNode);
    const onNodesChange = useWorkflowStore(state => state.onNodesChange);

    const updateNodeInternals = useUpdateNodeInternals();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data.error === 'Required input is missing.' || data.validationError === 'Required input is missing.') {
            const timer = setTimeout(() => {
                updateNodeData(id, { error: null, validationError: null });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [data.error, data.validationError, id, updateNodeData]);

    const imageInputCount = data.imageInputCount !== undefined ? data.imageInputCount : 1;

    useEffect(() => {
        updateNodeInternals(id);
    }, [imageInputCount, id, updateNodeInternals]);

    const handleAddImageInput = () => {
        if (imageInputCount < 10) {
            updateNodeData(id, { imageInputCount: imageInputCount + 1 });
        }
    };

    return (
        <>
            <div className={cn(
                "bg-[rgb(43,43,47)] border rounded-[16px] w-[460px] h-[558.8px] shadow-2xl flex flex-col group transition-all relative overflow-visible box-border",
                selected ? "border-[#52525b]" : "border-[#4a4a4f] hover:border-[#52525b]"
            )}
                style={{
                    width: '460px',
                    height: '558.8px'
                }}
            >
                <div className="flex items-center justify-between pl-[16px] pr-[16px] pt-[22px] pb-[7px] h-[12px] shrink-0 mb-[6px] overflow-visible">
                    <div className="flex items-center h-[12px]">
                        <input
                            ref={inputRef}
                            type="text"
                            value={data.label ?? 'Any LLM'}
                            onChange={(e) => updateNodeData(id, { label: e.target.value })}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    updateNodeData(id, { label: 'Any LLM' });
                                }
                            }}
                            className="text-[16px] font-semibold text-white leading-none bg-transparent border-none outline-none focus:outline-none ring-0 px-0 cursor-text"
                            style={{ width: 'auto', minWidth: '60px', maxWidth: '300px', color: 'white' }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <BaseNodeMenu
                        id={id}
                        onNodesChange={onNodesChange}
                        labelInputRef={inputRef}
                    >
                        <LLMModelSelectionSubmenu />
                    </BaseNodeMenu>
                </div>

                <div
                    className="rounded-[8px] flex flex-col mx-auto mt-[11px] shrink-0 relative border border-[#4a4a4f] box-border bg-[rgb(53,53,57)] overflow-hidden"
                    style={{
                        width: '423.2px',
                        height: '430px',
                    }}
                >
                    {data.isLoading && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[200] bg-[rgb(53,53,57)]/80 backdrop-blur-sm rounded-[8px]">
                            <div className="w-8 h-8 flex items-center justify-center animate-node-spin">
                                <Loader2 size={32} className="text-[#a1a1aa]" />
                            </div>
                        </div>
                    )}

                    <div className="w-full h-full p-[16px] flex flex-col flex-1 box-border overflow-y-auto custom-scrollbar nowheel nodrag">
                        {/* Error, Output, or Placeholder display */}
                        {data.error && data.error !== 'Required input is missing.' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col items-center gap-2">
                                    <span className="text-red-400 text-sm font-medium">Error</span>
                                    <p className="text-red-200/70 text-[13px] leading-relaxed">
                                        {data.error}
                                    </p>
                                </div>
                            </div>
                        ) : data.output ? (
                            <div className="w-full text-white text-[14px] leading-relaxed font-light whitespace-pre-wrap break-words">
                                {data.output}
                            </div>
                        ) : !data.isLoading && (
                            <div className="w-full text-[#71717a] flex flex-col items-start justify-start">
                                <span className="text-[14px] font-medium leading-relaxed">The generated text will appear here</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-[15px] ml-[17px] mb-[24px] flex items-center shrink-0 h-[36px]">
                    <button
                        onClick={handleAddImageInput}
                        disabled={imageInputCount >= 10}
                        className="flex items-center gap-2 bg-transparent border-0 shrink-0 !text-white hover:bg-[rgb(53,53,57)] transition-colors px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            width: '180px',
                            height: '28px',
                            borderRadius: '4px',
                            fontFamily: '"DM Sans", system-ui, -apple-system, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            lineHeight: '18px',
                            color: 'white !important'
                        }}
                    >
                        <Plus size={14} color="white" /> <span style={{ color: 'white', paddingRight: "5px" }}>Add another image input</span>
                    </button>

                    <div style={{ width: '124px' }} className="shrink-0" />

                    <button
                        onClick={() => runNode(id)}
                        disabled={data.isLoading}
                        className="flex items-center justify-center gap-2 bg-[rgb(43,43,47)] hover:bg-[rgb(53,53,57)] rounded-[8px] border border-[rgb(211,211,212)] transition-all disabled:opacity-50 shrink-0 shadow-sm !text-white"
                        style={{
                            width: '120px',
                            height: '36px',
                            fontFamily: '"DM Sans", system-ui, -apple-system, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '21px',
                            color: 'white !important'
                        }}
                    >
                        {data.isLoading ? <Loader2 size={14} className="animate-spin" /> : <MoveRight size={16} className="fill-current" style={{ color: 'white', paddingRight: '5px' }} />}
                        <span style={{ color: 'white' }}>Run Model</span>
                    </button>
                </div>

                <ValidationHandle
                    type="target"
                    position={Position.Left}
                    id="prompt-in"
                    nodeId={id}
                    style={{
                        top: '60px',
                    }}
                    className={cn(
                        "!w-3 !h-3 !border-4 !left-[-6px] z-50 transition-colors group/handle",
                        data.validationError ? "!bg-[rgb(241,160,250)] !border-[rgb(241,160,250)]" : "!bg-[#2b2b2f] !border-[rgb(241,160,250)]"
                    )}
                    showRequiredError={!!data.validationError || data.error === 'Required input is missing.'}
                />

                {(selected || data.validationError) && (
                    <div className="absolute left-[-125px] top-[60px] -translate-y-1/2 w-[100px] flex items-center justify-end pr-1 animate-in fade-in duration-200 z-50">
                        <span
                            className="text-[14px] font-[500] leading-normal transition-colors"
                            style={{
                                fontFamily: '"DM Mono", monospace',
                                color: data.validationError ? 'rgb(232,85,85)' : 'rgb(241,160,250)'
                            }}
                        >
                            Prompt*
                        </span>
                    </div>
                )}

                <ValidationHandle
                    type="target"
                    position={Position.Left}
                    id="system-prompt-in"
                    nodeId={id}
                    style={{ top: '100px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(241,160,250)] !left-[-6px] z-50 transition-colors group/handle"
                />

                {selected && (
                    <div className="absolute left-[-150px] top-[100px] -translate-y-1/2 w-[125px] flex items-center justify-end pr-2 animate-in fade-in duration-200 z-50">
                        <span className="text-[14px] font-[500] text-[rgb(241,160,250)] leading-normal" style={{ fontFamily: '"DM Mono", monospace' }}>
                            System Prompt
                        </span>
                    </div>
                )}

                {Array.from({ length: imageInputCount }).map((_, index) => {
                    const topPosition = 140 + (index * 40);
                    return (
                        <React.Fragment key={`image-input-${index}`}>
                            <ValidationHandle
                                type="target"
                                position={Position.Left}
                                id={`image-in-${index}`}
                                nodeId={id}
                                style={{ top: `${topPosition}px` }}
                                className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(110,221,179)] !left-[-6px] z-50 transition-colors group/handle"
                            />
                            {selected && (
                                <div
                                    className="absolute -translate-y-1/2 w-[100px] flex items-center justify-end pr-1 animate-in fade-in duration-200 z-50"
                                    style={{ left: '-125px', top: `${topPosition}px` }}
                                >
                                    <span className="text-[14px] font-[500] text-[rgb(110,221,179)] leading-normal" style={{ fontFamily: '"DM Mono", monospace' }}>
                                        Image {index + 1}
                                    </span>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}

                <ValidationHandle
                    type="source"
                    position={Position.Right}
                    id="response-out"
                    nodeId={id}
                    style={{ top: '200px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(241,160,250)] !right-[-6px] z-50 transition-colors group/handle"
                />

                {selected && (
                    <div className="absolute right-[-70px] top-[200px] -translate-y-1/2 flex items-center pl-2 animate-in fade-in duration-200 z-50">
                        <span className="text-[14px] font-[500] text-[rgb(241,160,250)] leading-normal" style={{ fontFamily: '"DM Mono", monospace', color: 'rgb(241,160,250)' }}>Result</span>
                    </div>
                )}
            </div>
        </>
    );
}