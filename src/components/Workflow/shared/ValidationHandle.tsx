import React from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowStore } from '@/store/workflowStore';

interface ValidationHandleProps {
    id: string;
    type: 'source' | 'target';
    position: Position;
    nodeId: string;
    style?: React.CSSProperties;
    className?: string;
    showRequiredError?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

/**
 * ValidationHandle - A ReactFlow Handle with integrated validation tooltip logic.
 */
export const ValidationHandle: React.FC<ValidationHandleProps> = ({
    id,
    type,
    position,
    nodeId,
    style,
    className,
    showRequiredError,
    onMouseEnter,
    onMouseLeave
}) => {
    const connectionStart = useWorkflowStore(state => state.connectionStart);
    const connectionError = useWorkflowStore(state => state.connectionError);
    const setConnectionError = useWorkflowStore(state => state.setConnectionError);
    const validateConnection = useWorkflowStore(state => state.validateConnection);

    const handleMouseEnter = () => {
        if (connectionStart) {
            const result = validateConnection(
                connectionStart.nodeId,
                connectionStart.handleId,
                nodeId,
                id
            );
            if (!result.isValid && result.message) {
                setConnectionError({ nodeId, handleId: id, message: result.message });
            }
        }
        onMouseEnter?.();
    };

    const handleMouseLeave = () => {
        setConnectionError(null);
        onMouseLeave?.();
    };

    const isConnectionError = connectionError?.nodeId === nodeId && connectionError?.handleId === id;

    return (
        <Handle
            type={type}
            position={position}
            id={id}
            style={style}
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            isConnectableStart={type === 'source'}
            isConnectableEnd={type === 'target'}
        >
            {showRequiredError && (
                <>
                    <div className="absolute top-[-4px] left-[-4px] bottom-[-4px] right-[-4px] flex items-center justify-center pointer-events-none">
                        <div className="w-full h-full rounded-full bg-[rgb(241,160,250)]/20 animate-ping" />
                    </div>
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[rgb(17,17,19)] text-white text-[11px] font-medium px-[12px] py-[8px] rounded-[6px] border border-[rgb(53,53,57)] shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 z-[100] pointer-events-none">
                        Required input is missing.
                    </div>
                </>
            )}
            {isConnectionError && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[rgb(17,17,19)] text-white text-[11px] font-medium px-[12px] py-[8px] rounded-[6px] border border-[rgb(53,53,57)] shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 z-[100] pointer-events-none">
                    {connectionError.message}
                </div>
            )}
        </Handle>
    );
};
