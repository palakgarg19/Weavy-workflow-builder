import { useRef, useEffect } from 'react';
import { Position } from 'reactflow';
import { useWorkflowStore, TextNodeData } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { BaseNodeMenu } from '../shared/BaseNodeMenu';
import { ValidationHandle } from '../shared/ValidationHandle';

/**
 * TextNode - A React Flow node for manual text/prompt entry.
 */
export default function TextNode({ id, data, selected }: { id: string, data: TextNodeData, selected: boolean }) {
    // Atomic selectors for better performance
    const updateNodeData = useWorkflowStore(state => state.updateNodeData);
    const onNodesChange = useWorkflowStore(state => state.onNodesChange);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);

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
                        ref={labelInputRef}
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

                    <BaseNodeMenu
                        id={id}
                        onNodesChange={onNodesChange}
                        labelInputRef={labelInputRef}
                    />
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

                <ValidationHandle
                    type="source"
                    position={Position.Right}
                    id="text-out"
                    nodeId={id}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(241,160,250)] !right-[-7px] z-50 transition-colors group/handle"
                />

                {selected && (
                    <div className="absolute right-[-70px] top-[50%] -translate-y-1/2 flex items-center pl-1 animate-in fade-in duration-200 z-50">
                        <span
                            className="text-[14px] font-[500] leading-normal text-[rgb(241,160,250)] transition-colors"
                            style={{
                                fontFamily: '"DM Mono", monospace',
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
