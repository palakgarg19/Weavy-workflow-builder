import React, { useState, useRef } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { MoreHorizontal, Loader2, Plus, MoveRight, Asterisk } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { DropdownMenu } from './DropdownMenu';
import { RenameModal } from './RenameModal';

const AVAILABLE_MODELS = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Standard)', disabled: false },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Fast)', disabled: true },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Reasoning)', disabled: true },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)', disabled: false },
];

/**
 * LLMNode - Processes text and image inputs through Google Gemini models.
 */
export default function LLMNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
    const { updateNodeData, runNode } = useWorkflowStore();
    const { deleteElements } = useReactFlow();

    // UI State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    // --- Handlers ---

    // DEFAULT: If undefined, start with 1 image handle.
    const imageInputCount = data.imageInputCount !== undefined ? data.imageInputCount : 1;

    const handleAddImageInput = () => {
        updateNodeData(id, { imageInputCount: imageInputCount + 1 });
    };

    const handleDelete = () => deleteElements({ nodes: [{ id }] });

    const onRenameSubmit = (newName: string) => {
        updateNodeData(id, { label: newName });
        setIsRenameModalOpen(false);
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isMenuOpen && menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect();
            setMenuPosition({ x: rect.right - 128, y: rect.bottom + 4 });
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const currentModel = data.model || 'gemini-2.5-flash';

    return (
        <>
            <RenameModal
                isOpen={isRenameModalOpen}
                initialValue={data.label || 'Any LLM'}
                onClose={() => setIsRenameModalOpen(false)}
                onRename={onRenameSubmit}
            />

            <DropdownMenu
                isOpen={isMenuOpen}
                position={menuPosition}
                onClose={() => setIsMenuOpen(false)}
                onRename={() => setIsRenameModalOpen(true)}
                onDelete={handleDelete}
            />

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

                    <button
                        ref={menuButtonRef}
                        onClick={toggleMenu}
                        className={cn(
                            "rounded-[4px] transition-all duration-200 flex items-center justify-center relative z-10 border-none outline-none focus:outline-none ring-0 shadow-none",
                            isMenuOpen ? "bg-[rgb(53,53,57)] text-white" : "bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white"
                        )}
                        style={{ height: '28px', width: '28px' }}
                    >
                        <MoreHorizontal size={20} strokeWidth={1} />
                    </button>
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
                            <style>
                                {`
                            @keyframes node-spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}
                            </style>
                            <div style={{ animation: 'node-spin 1s linear infinite' }} className="w-8 h-8 flex items-center justify-center">
                                <Loader2 size={32} className="text-[#a1a1aa]" />
                            </div>
                        </div>
                    )}

                    <div className="w-full h-full p-[16px] flex flex-col flex-1 box-border overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {/* Error, Output, or Placeholder display */}
                        {data.error ? (
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

                {/* Action Bar */}
                <div className="mt-[15px] ml-[17px] mb-[24px] flex items-center shrink-0 h-[36px]">
                    <button
                        onClick={handleAddImageInput}
                        className="flex items-center gap-2 bg-transparent border-0 shrink-0 !text-white hover:bg-[rgb(53,53,57)] transition-colors px-1"
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

                {/* Handles & Validation UI */}
                <Handle
                    type="target"
                    position={Position.Left}
                    id="prompt-in"
                    style={{
                        top: '60px',
                        borderColor: data.validationError ? 'rgb(241,160,250)' : 'rgb(241,160,250)',
                        backgroundColor: data.validationError ? 'rgb(241,160,250)' : '#2b2b2f'
                    }}
                    className={cn(
                        "!w-3 !h-3 !border-4 !left-[-6px] z-50 transition-colors group/handle",
                        data.validationError ? "!bg-[rgb(241,160,250)] !border-[rgb(241,160,250)]" : "!bg-[#2b2b2f] !border-[rgb(241,160,250)]"
                    )}
                >
                    {data.validationError && (
                        <>
                            <div className="absolute top-[-4px] left-[-4px] bottom-[-4px] right-[-4px] flex items-center justify-center pointer-events-none">
                                <Asterisk size={12} className="text-[rgb(232,85,85)] stroke-[4px]" />
                            </div>
                            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2 py-1 bg-[#18181b] text-white text-[12px] font-medium rounded-[4px] whitespace-nowrap opacity-0 group-hover/handle:opacity-100 transition-opacity shadow-xl border border-[#27272a] pointer-events-none z-[100]">
                                {data.validationError}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#18181b]"></div>
                            </div>
                        </>
                    )}
                </Handle>

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

                <Handle
                    type="target"
                    position={Position.Left}
                    id="system-prompt-in"
                    style={{ top: '100px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(241,160,250)] !left-[-6px] z-50 transition-colors"
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
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`image-in-${index}`}
                                style={{ top: `${topPosition}px` }}
                                className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(110,221,179)] !left-[-6px] z-50"
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

                <Handle
                    type="source"
                    position={Position.Right}
                    id="response-out"
                    style={{ top: '100px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(241,160,250)] !right-[-6px] z-50"
                />
                {selected && (
                    <div className="absolute right-[-50px] top-[100px] -translate-y-1/2 flex items-center pl-1 animate-in fade-in duration-200 z-50">
                        <span className="text-[14px] font-[500] text-[rgb(241,160,250)] leading-normal" style={{ fontFamily: '"DM Mono", monospace' }}>Text</span>
                    </div>
                )}

            </div>
        </>
    );
}