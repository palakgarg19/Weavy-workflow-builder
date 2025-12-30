import React, { useState, useRef } from 'react';
import { Position } from 'reactflow';
import { Upload, X } from 'lucide-react';
import { useWorkflowStore, UploadNodeData } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { BaseNodeMenu } from '../shared/BaseNodeMenu';
import { ValidationHandle } from '../shared/ValidationHandle';

/**
 * UploadNode - Handles file uploads and provides an image source for downstream nodes.
 */
export default function UploadNode({ id, data, selected }: { id: string, data: UploadNodeData, selected: boolean }) {
    const updateNodeData = useWorkflowStore(state => state.updateNodeData);
    const onNodesChange = useWorkflowStore(state => state.onNodesChange);

    const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 5MB limit
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Please upload an image smaller than 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateNodeData(id, { image: reader.result as string, uploadError: null });
            };
            reader.onerror = () => {
                updateNodeData(id, { uploadError: "Failed to read file" });
            };
            try {
                reader.readAsDataURL(file);
            } catch (err) {
                updateNodeData(id, { uploadError: "Upload failed" });
            }
        }
    };

    return (
        <>
            <div className={cn(
                "bg-[rgb(43,43,47)] border rounded-[16px] w-[460px] shadow-2xl flex flex-col group transition-all relative overflow-visible box-border pb-[20px]",
                selected ? "border-[#52525b]" : "border-[#4a4a4f] hover:border-[#52525b]"
            )}
                style={{
                    width: '460px',
                    height: 'auto'
                }}
            >
                <div className="flex items-center justify-between pl-[16px] pr-[16px] pt-[22px] pb-[7px] h-[12px] shrink-0 mb-[6px] overflow-visible">
                    <div className="flex items-center h-[12px]">
                        <input
                            ref={labelInputRef}
                            type="text"
                            value={data.label ?? 'Image file'}
                            onChange={(e) => updateNodeData(id, { label: e.target.value })}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    updateNodeData(id, { label: 'Image file' });
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
                        labelInputRef={labelInputRef}
                    />
                </div>

                {/* Drag-and-drop / Preview area */}
                <div
                    className="rounded-none overflow-hidden flex flex-col mx-auto mt-[11px] shrink-0 relative group/preview"
                    style={{
                        width: '423.2px',
                        height: (data.image && imageSize)
                            ? `${(imageSize.height / imageSize.width) * 423.2}px`
                            : '430px',
                        backgroundColor: '#2e2e32',
                        backgroundImage: data.image ? 'none' : `
                    linear-gradient(45deg, #3a3a3f 25%, transparent 25%),
                    linear-gradient(-45deg, #3a3a3f 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #3a3a3f 75%),
                    linear-gradient(-45deg, transparent 75%, #3a3a3f 75%)
                `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                >
                    {data.image ? (
                        <div className="relative w-full h-full">
                            <img
                                src={data.image}
                                alt="Uploaded content"
                                className="w-full h-full object-contain"
                                onLoad={(e) => {
                                    const { naturalWidth, naturalHeight } = e.currentTarget;
                                    setImageSize({ width: naturalWidth, height: naturalHeight });
                                }}
                            />
                            <button
                                onClick={() => {
                                    updateNodeData(id, { image: null });
                                    setImageSize(null);
                                }}
                                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition-colors z-20"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer group/upload"
                        >
                            <div className="mb-3 p-3 bg-[#3a3a3f] rounded-full border border-[#52525b] group-hover/upload:border-[#71717a] transition-colors">
                                <Upload size={20} className="text-[#a1a1aa]" />
                            </div>
                            <span className="text-[13px] text-[#a1a1aa] font-medium">Click to upload</span>
                            {data.uploadError && (
                                <span className="text-[12px] text-red-500 mt-2 font-medium bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">{data.uploadError}</span>
                            )}
                            <input type="file" ref={inputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                        </div>
                    )}
                </div>

                <ValidationHandle
                    type="source"
                    position={Position.Right}
                    id="image-out"
                    nodeId={id}
                    style={{ top: '200px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(110,221,179)] !right-[-6px] z-50 transition-colors group/handle"
                />

                {selected && (
                    <div className="absolute right-[-70px] top-[200px] -translate-y-1/2 flex items-center pl-2 animate-in fade-in duration-200 z-50">
                        <span className="text-[14px] font-[500] text-[rgb(110,221,179)] leading-normal" style={{ fontFamily: '"DM Mono", monospace', color: 'rgb(110,221,179)' }}>Image</span>
                    </div>
                )}
            </div>
        </>
    );
}
