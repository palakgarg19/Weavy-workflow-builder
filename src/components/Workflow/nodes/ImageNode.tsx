import React, { useState, useRef, useEffect } from 'react';
import { Position, useUpdateNodeInternals } from 'reactflow';
import { Plus, MoveRight, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { useWorkflowStore, ImageNodeData } from '@/store/workflowStore';
import { cn } from '@/lib/utils';
import { BaseNodeMenu, useBaseNodeMenu } from '../shared/BaseNodeMenu';
import { ValidationHandle } from '../shared/ValidationHandle';

/**
 * ImageModelSelectionSubmenu - Handles model selection for ImageNode.
 * Uses BaseNodeMenuContext to close the menu upon selection.
 */
const ImageModelSelectionSubmenu = ({ id, selectedModel, updateNodeData }: { id: string, selectedModel: string, updateNodeData: any }) => {
    const { closeMenu } = useBaseNodeMenu();
    const [showModelSubmenu, setShowModelSubmenu] = useState(false);

    return (
        <div className="w-full px-[3px] relative">
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

            {showModelSubmenu && (
                <div className="w-full flex flex-col items-center justify-center mt-1">
                    <button
                        onClick={() => {
                            updateNodeData(id, { selectedModel: 'flux-schnell' });
                            setShowModelSubmenu(false);
                            closeMenu();
                        }}
                        className={cn(
                            "px-[12px] pl-[24px] flex items-center justify-start hover:bg-[rgb(53,53,57)] transition-colors border-none outline-none shadow-none ring-0 rounded-[4px]",
                            selectedModel === 'flux-schnell' ? "bg-[rgb(53,53,57)]" : "bg-transparent"
                        )}
                        style={{ width: '100%', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                    >
                        <span>Flux.1</span>
                    </button>
                    <button
                        onClick={() => {
                            updateNodeData(id, { selectedModel: 'flux-plus-gemini' });
                            setShowModelSubmenu(false);
                            closeMenu();
                        }}
                        className={cn(
                            "px-[12px] pl-[24px] flex items-center justify-start hover:bg-[rgb(53,53,57)] transition-colors border-none outline-none shadow-none ring-0 rounded-[4px]",
                            selectedModel === 'flux-plus-gemini' ? "bg-[rgb(53,53,57)]" : "bg-transparent"
                        )}
                        style={{ width: '100%', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                    >
                        <span>Flux.1 + Gemini</span>
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * ImageNode - Generates images based on text prompts and optional input images.
 */
export default function ImageNode({ id, data, selected }: { id: string, data: ImageNodeData, selected: boolean }) {
    // Atomic selectors for better performance
    const updateNodeData = useWorkflowStore(state => state.updateNodeData);
    const runNode = useWorkflowStore(state => state.runNode);
    const onNodesChange = useWorkflowStore(state => state.onNodesChange);

    const updateNodeInternals = useUpdateNodeInternals();
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
    const [showModelSubmenu, setShowModelSubmenu] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data.error === 'Required input is missing.' || data.validationError === 'Required input is missing.') {
            const timer = setTimeout(() => {
                updateNodeData(id, { error: null, validationError: null });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [data.error, data.validationError, id, updateNodeData]);

    useEffect(() => {
        if (data.isLoading) {
            setIsImageLoading(true);
            setImageSize(null);
            return;
        }

        if (data.output && !imageSize) {
            setIsImageLoading(true);

            const timer = setTimeout(() => {
                setIsImageLoading(false);
            }, 30000);
            return () => clearTimeout(timer);
        }

        if (!data.output && !data.isLoading) {
            setIsImageLoading(false);
            setImageSize(null);
        }
    }, [data.isLoading, data.output, imageSize]);

    const imageInputCount = data.imageInputCount || 1;
    const selectedModel = data.selectedModel || 'flux-schnell';

    useEffect(() => {
        updateNodeInternals(id);
    }, [imageInputCount, selectedModel, id, updateNodeInternals]);

    const handleAddImageInput = () => {
        if (imageInputCount < 10) {
            updateNodeData(id, { imageInputCount: imageInputCount + 1 });
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
                            ref={inputRef}
                            type="text"
                            value={data.label ?? 'Image'}
                            onChange={(e) => updateNodeData(id, { label: e.target.value })}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    updateNodeData(id, { label: 'Image' });
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
                        <ImageModelSelectionSubmenu
                            id={id}
                            selectedModel={selectedModel}
                            updateNodeData={updateNodeData}
                        />
                    </BaseNodeMenu>
                </div>
                <div
                    className="rounded-none overflow-hidden flex flex-col mx-auto mt-[11px] shrink-0 relative group/preview"
                    style={{
                        width: '423.2px',
                        height: (data.output && !isImageLoading && imageSize)
                            ? `${(imageSize.height / imageSize.width) * 423.2}px`
                            : '430px',
                        backgroundColor: '#2e2e32',
                        backgroundImage: (data.output && !isImageLoading) ? 'none' : `
                    linear-gradient(45deg, #3a3a3f 25%, transparent 25%),
                    linear-gradient(-45deg, #3a3a3f 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #3a3a3f 75%),
                    linear-gradient(-45deg, transparent 75%, #3a3a3f 75%)
                `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                >
                    {(data.isLoading || (data.output && isImageLoading)) && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[200] bg-[#2e2e32]/80 backdrop-blur-sm">
                            <div className="w-8 h-8 flex items-center justify-center animate-node-spin">
                                <Loader2 size={32} className="text-[#a1a1aa]" />
                            </div>
                        </div>
                    )}

                    {data.error && data.error !== 'Required input is missing.' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10 bg-[#2e2e32]">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col items-center gap-2 max-w-[80%]">
                                <span className="text-red-400 text-sm font-medium">Error</span>
                                <p className="text-red-200/70 text-[13px] leading-relaxed">
                                    {data.error}
                                </p>
                            </div>
                        </div>
                    ) : data.output ? (
                        <div className="relative z-10 h-full w-full flex items-center justify-center bg-black/20">
                            <img
                                src={data.output}
                                alt="Generated"
                                onLoad={(e) => {
                                    const { naturalWidth, naturalHeight } = e.currentTarget;
                                    setImageSize({ width: naturalWidth, height: naturalHeight });
                                    setIsImageLoading(false);
                                }}
                                onError={(e) => {
                                    console.error("Image load failed", e.currentTarget.src);
                                    setIsImageLoading(false);
                                    updateNodeData(id, { error: 'Failed to load image from provider.' });
                                }}
                                className={cn(
                                    "w-full h-full object-contain transition-opacity duration-300",
                                    isImageLoading ? "opacity-0" : "opacity-100"
                                )}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#71717a] z-10">
                        </div>
                    )}
                </div>

                <div className="mt-[15px] ml-[17px] flex items-center shrink-0 h-[36px]">
                    {selectedModel === 'flux-plus-gemini' && (
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
                    )}

                    <div style={{ width: (selectedModel === 'flux-plus-gemini') ? '124px' : '304px' }} className="shrink-0" />

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

                {/* Handles */}
                <ValidationHandle
                    type="target"
                    position={Position.Left}
                    id="text-in"
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

                {/* Additional Input Handles */}
                {(selectedModel === 'flux-plus-gemini') && Array.from({ length: imageInputCount }).map((_, index) => {
                    const topPosition = 100 + (index * 40);
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
                    id="image-out"
                    nodeId={id}
                    style={{ top: '200px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(110,221,179)] !right-[-6px] z-50 transition-colors group/handle"
                />

                {selected && (
                    <div className="absolute right-[-70px] top-[200px] -translate-y-1/2 flex items-center pl-2 animate-in fade-in duration-200 z-50">
                        <span className="text-[14px] font-[500] text-[rgb(110,221,179)] leading-normal" style={{ fontFamily: '"DM Mono", monospace', color: 'rgb(110,221,179)' }}>Result</span>
                    </div>
                )}
            </div >
        </>
    );
}