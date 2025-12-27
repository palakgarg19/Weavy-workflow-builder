import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { MoreHorizontal, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * TextNode - A React Flow node for manual text/prompt entry.
 */
export default function TextNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
    const { updateNodeData } = useWorkflowStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [data.text]);

    return (
        <>
            <div
                className={cn(
                    "bg-[rgb(43,43,47)] border rounded-[16px] w-[460px] min-h-[267.2px] shadow-sm flex flex-col group transition-all relative overflow-visible box-border",
                    selected ? "border-[#52525b]" : "border-[#4a4a4f] hover:border-[#52525b]"
                )}
            >
                <div className="flex items-center justify-between pl-[30px] pr-[16px] pt-[16px] mb-[12px] h-[20px] shrink-0">
                    <input
                        type="text"
                        value={data.label ?? 'Prompt'}
                        onChange={(e) => updateNodeData(id, { label: e.target.value })}
                        onBlur={(e) => {
                            if (!e.target.value.trim()) {
                                updateNodeData(id, { label: 'Prompt' });
                            }
                        }}
                        className="text-[16px] font-semibold text-white tracking-tight leading-none bg-transparent border-none outline-none focus:outline-none ring-0 px-0 cursor-text"
                        style={{ width: 'auto', minWidth: '60px', maxWidth: '300px', color: 'white' }}
                        onFocus={(e) => e.target.select()}
                    />

                    <button
                        className={cn(
                            "rounded-[4px] transition-all duration-200 flex items-center justify-center relative z-10 border-none outline-none focus:outline-none ring-0 shadow-none",
                            "bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white"
                        )}
                        style={{ height: '28px', width: '28px' }}
                    >
                        <MoreHorizontal size={20} strokeWidth={1} />
                    </button>
                </div>

                <div className="px-[25.2px] pb-[27.2px] shrink-0">
                    <div className="bg-[rgb(53,53,57)] rounded-[6px] w-[409.6px] min-h-[192px] flex flex-col box-border">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent border-0 px-[12px] py-[12px] text-[16px] font-medium text-[#FFFFFF] placeholder:text-[#71717a] resize-none focus:outline-none leading-[24px] nodrag overflow-hidden box-border"
                            placeholder="Enter your prompt here..."
                            value={data.text || ''}
                            onChange={(e) => updateNodeData(id, { text: e.target.value })}
                            style={{
                                minHeight: '192px',
                                fontFamily: '"DM Sans", sans-serif'
                            }}
                        />
                    </div>
                </div>

                {/* Handle */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="text-out"
                    isConnectableEnd={false}
                    className={cn(
                        "!w-3 !h-3 !border-4 !right-[-7px] z-50 transition-colors group/handle",
                        data.validationError ? "!bg-[rgb(241,160,250)] !border-[rgb(241,160,250)]" : "!bg-[#2b2b2f] !border-[rgb(241,160,250)]"
                    )}
                    style={{
                        borderColor: data.validationError ? 'rgb(241,160,250)' : 'rgb(241,160,250)',
                        backgroundColor: data.validationError ? 'rgb(241,160,250)' : '#2b2b2f'
                    }}
                >
                    {data.validationError && (
                        <>
                            <div className="absolute top-[-4px] left-[-4px] bottom-[-4px] right-[-4px] flex items-center justify-center pointer-events-none">
                                <div className="w-full h-full rounded-full bg-[rgb(241,160,250)]/20 animate-ping" />
                            </div>
                            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[rgb(241,160,250)] text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap animate-in fade-in slide-in-from-right-2 z-50 pointer-events-none">
                                Missing Output
                            </div>
                        </>
                    )}
                </Handle>
                {(selected || data.validationError) && (
                    <div className="absolute right-[-70px] top-[50%] -translate-y-1/2 flex items-center pl-1 animate-in fade-in duration-200 z-50">
                        <span
                            className="text-[14px] font-[500] leading-normal transition-colors"
                            style={{
                                fontFamily: '"DM Mono", monospace',
                                color: data.validationError ? 'rgb(232,85,85)' : 'rgb(241,160,250)'
                            }}
                        >
                            Prompt
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
