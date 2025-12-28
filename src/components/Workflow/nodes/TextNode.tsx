import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { MoreHorizontal, Asterisk, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TextNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
    const { updateNodeData, onNodesChange } = useWorkflowStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                "rounded-[4px] transition-all duration-200 flex items-center justify-center relative z-10 border-none outline-none focus:outline-none ring-0 shadow-none",
                                "bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white",
                                isMenuOpen ? "bg-[rgb(53,53,57)] text-white" : ""
                            )}
                            style={{ height: '28px', width: '28px' }}
                        >
                            <MoreHorizontal size={20} strokeWidth={1} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-[9997]"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div
                                    className="absolute bottom-full mb-2 right-0 bg-[rgb(33,33,38)] rounded-[8px] z-[9998] py-[8px] flex flex-col items-center justify-center border border-[rgb(53,53,57)] shadow-xl"
                                    style={{
                                        width: '190.4px',
                                        fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif'
                                    }}
                                >
                                    <div className="w-full px-[3px]">
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setTimeout(() => {
                                                    labelInputRef.current?.focus();
                                                    labelInputRef.current?.select();
                                                }, 50);
                                            }}
                                            className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                                            style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                        >
                                            <span>Rename</span>
                                            <Pencil size={12} className="opacity-50" />
                                        </button>
                                    </div>

                                    <div className="w-full px-[3px]">
                                        <button
                                            onClick={() => {
                                                onNodesChange([{ id, type: 'remove' }]);
                                                setIsMenuOpen(false);
                                            }}
                                            className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px] group/delete"
                                            style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                        >
                                            <span className="group-hover/delete:text-red-400 transition-colors">Delete</span>
                                            <Trash2 size={12} className="opacity-50 group-hover/delete:text-red-400 transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
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

                <Handle
                    type="source"
                    position={Position.Right}
                    id="text-out"
                    isConnectableEnd={false}
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
