import { getBezierPath, ConnectionLineComponentProps } from 'reactflow';

export function CustomConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
    fromNode,
    connectionStatus,
    fromPosition,
    toPosition,
}: ConnectionLineComponentProps) {
    const [edgePath] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
    });

    // Color logic based on source
    let strokeColor = 'rgb(241,160,250)'; // Default purple for text

    if (fromNode?.type === 'uploadNode' || fromNode?.type === 'imageNode') {
        strokeColor = 'rgb(110,221,179)';
    }

    if (connectionStatus === 'invalid') {
        strokeColor = 'rgb(232,85,85)';
    }

    return (
        <g>
            <path
                fill="none"
                stroke={strokeColor}
                strokeWidth={3}
                d={edgePath}
            />
            <circle
                cx={toX}
                cy={toY}
                r={3}
                stroke={strokeColor}
                strokeWidth={3}
            />
        </g>
    );
}
