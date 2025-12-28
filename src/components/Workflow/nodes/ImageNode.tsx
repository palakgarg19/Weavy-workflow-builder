import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { Plus, MoveRight, Loader2, MoreHorizontal, Trash2, ChevronRight, Pencil, ChevronDown } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';

export default function ImageNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
    const {
        updateNodeData,
        runNode,
        onNodesChange,
        connectionStart,
        connectionError,
        setConnectionError,
        validateConnection
    } = useWorkflowStore();
    const updateNodeInternals = useUpdateNodeInternals();
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    React.useEffect(() => {
        if (data.output) {
            setIsImageLoading(true);
        } else if (!data.isLoading) {
            setImageSize(null);
        }
    }, [data.output, data.isLoading]);

    const imageInputCount = data.imageInputCount || 1;
    const selectedModel = data.selectedModel || 'pollinations';

    useEffect(() => {
        updateNodeInternals(id);
    }, [imageInputCount, id, updateNodeInternals]);

    const handleAddImageInput = () => {
        if (imageInputCount < 10) {
            updateNodeData(id, { imageInputCount: imageInputCount + 1 });
        }
    };

    const onHandleMouseEnter = (handleId: string) => {
        if (connectionStart && connectionStart.nodeId !== id) {
            const result = validateConnection(
                connectionStart.nodeId,
                connectionStart.handleId,
                id,
                handleId
            );
            if (!result.isValid && result.message) {
                setConnectionError({ nodeId: id, handleId, message: result.message });
            }
        }
    };

    const onHandleMouseLeave = () => {
        setConnectionError(null);
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
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setShowModelSubmenu(false);
                                    }}
                                />
                                <div
                                    className="absolute bottom-full mb-2 right-0 bg-[rgb(33,33,38)] rounded-[8px] z-[9998] py-[8px] flex flex-col items-center justify-center border border-[rgb(53,53,57)] shadow-xl"
                                    style={{
                                        width: '190.4px',
                                        fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif'
                                    }}
                                >
                                    {/* Model Selection */}
                                    <div
                                        className="w-full px-[3px] relative"
                                    >
                                        <button
                                            onClick={() => setShowModelSubmenu(!showModelSubmenu)}
                                            className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                                            style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                        >
                                            <span>Select Model</span>
                                            {showModelSubmenu ? <ChevronDown size={12} className="opacity-50" /> : <ChevronRight size={12} className="opacity-50" />}
                                        </button>

                                        {/* Model Submenu */}
                                        {showModelSubmenu && (
                                            <div
                                                className="w-full flex flex-col items-center justify-center mt-1"
                                                style={{
                                                    width: '100%'
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        updateNodeData(id, { selectedModel: 'pollinations' });
                                                        setIsMenuOpen(false);
                                                        setShowModelSubmenu(false);
                                                    }}
                                                    className={cn(
                                                        "px-[12px] pl-[24px] flex items-center justify-start hover:bg-[rgb(53,53,57)] transition-colors border-none outline-none shadow-none ring-0 rounded-[4px]",
                                                        selectedModel === 'pollinations' ? "bg-[rgb(53,53,57)]" : "bg-transparent"
                                                    )}
                                                    style={{ width: '100%', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                                >
                                                    <span>Pollinations</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        updateNodeData(id, { selectedModel: 'flux-schnell' });
                                                        setIsMenuOpen(false);
                                                        setShowModelSubmenu(false);
                                                    }}
                                                    className={cn(
                                                        "px-[12px] pl-[24px] flex items-center justify-start hover:bg-[rgb(53,53,57)] transition-colors border-none outline-none shadow-none ring-0 rounded-[4px]",
                                                        selectedModel === 'flux-schnell' ? "bg-[rgb(53,53,57)]" : "bg-transparent"
                                                    )}
                                                    style={{ width: '100%', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                                >
                                                    <span>FLUX.1-schnell</span>
                                                </button>
                                                <button
                                                    disabled
                                                    className={cn(
                                                        "px-[12px] pl-[24px] flex items-center justify-start transition-colors border-none outline-none shadow-none ring-0 rounded-[4px] opacity-50 cursor-not-allowed",
                                                        selectedModel === 'instruct-pix2pix' ? "bg-[rgb(53,53,57)]" : "bg-transparent"
                                                    )}
                                                    style={{ width: '100%', height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                                >
                                                    <span>Instruct-Pix2Pix (Inactive)</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rename */}
                                    <div className="w-full px-[3px]">
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setTimeout(() => {
                                                    inputRef.current?.focus();
                                                    inputRef.current?.select();
                                                }, 50);
                                            }}
                                            className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                                            style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                        >
                                            <span>Rename</span>
                                            <Pencil size={12} className="opacity-50" />
                                        </button>
                                    </div>

                                    {/* Delete */}
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
                                onError={() => setIsImageLoading(false)}
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
                    {selectedModel !== 'instruct-pix2pix' && selectedModel !== 'flux-schnell' && (
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

                    <div style={{ width: (selectedModel === 'instruct-pix2pix' || selectedModel === 'flux-schnell') ? '304px' : '124px' }} className="shrink-0" />

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
                <Handle
                    type="target"
                    position={Position.Left}
                    id="text-in"
                    isConnectableStart={false}
                    style={{
                        top: '60px',
                        borderColor: data.validationError ? 'rgb(241,160,250)' : 'rgb(241,160,250)',
                        backgroundColor: data.validationError ? 'rgb(241,160,250)' : '#2b2b2f'
                    }}
                    className={cn(
                        "!w-3 !h-3 !border-4 !left-[-6px] z-50 transition-colors group/handle",
                        data.validationError ? "!bg-[rgb(241,160,250)] !border-[rgb(241,160,250)]" : "!bg-[#2b2b2f] !border-[rgb(241,160,250)]"
                    )}
                    onMouseEnter={() => onHandleMouseEnter('text-in')}
                    onMouseLeave={onHandleMouseLeave}
                >
                    {(data.validationError || data.error === 'Required input is missing.') && (
                        <>
                            <div className="absolute top-[-4px] left-[-4px] bottom-[-4px] right-[-4px] flex items-center justify-center pointer-events-none">
                                <div className="w-full h-full rounded-full bg-[rgb(241,160,250)]/20 animate-ping" />
                            </div>
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[rgb(17,17,19)] text-white text-[11px] font-medium px-[12px] py-[8px] rounded-[6px] border border-[rgb(53,53,57)] shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 z-[100] pointer-events-none">
                                Required input is missing.
                            </div>
                        </>
                    )}
                    {connectionError?.nodeId === id && connectionError?.handleId === 'text-in' && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[rgb(17,17,19)] text-white text-[11px] font-medium px-[12px] py-[8px] rounded-[6px] border border-[rgb(53,53,57)] shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 z-[100] pointer-events-none">
                            {connectionError.message}
                        </div>
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

                {/* Additional Input Handles */}
                {selectedModel !== 'flux-schnell' && Array.from({ length: imageInputCount }).map((_, index) => {
                    const topPosition = 100 + (index * 40);
                    return (
                        <React.Fragment key={`image-input-${index}`}>
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`image-in-${index}`}
                                isConnectableStart={false}
                                style={{ top: `${topPosition}px` }}
                                className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(110,221,179)] !left-[-6px] z-50 transition-colors group/handle"
                                onMouseEnter={() => onHandleMouseEnter(`image-in-${index}`)}
                                onMouseLeave={onHandleMouseLeave}
                            >
                                {connectionError?.nodeId === id && connectionError?.handleId === `image-in-${index}` && (
                                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[rgb(17,17,19)] text-white text-[11px] font-medium px-[12px] py-[8px] rounded-[6px] border border-[rgb(53,53,57)] shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 z-[100] pointer-events-none">
                                        {connectionError.message}
                                    </div>
                                )}
                            </Handle>
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
                    id="image-out"
                    style={{ top: '200px' }}
                    className="!w-3 !h-3 !bg-[#2b2b2f] !border-4 !border-[rgb(110,221,179)] !right-[-6px] z-50 transition-colors group/handle"
                >
                </Handle>
                {selected && (
                    <div className="absolute right-[-70px] top-[200px] -translate-y-1/2 flex items-center pl-2 animate-in fade-in duration-200 z-50">
                        <span className="text-[14px] font-[500] text-[rgb(110,221,179)] leading-normal" style={{ fontFamily: '"DM Mono", monospace', color: 'rgb(110,221,179)' }}>Result</span>
                    </div>
                )}
            </div >
        </>
    );
}