import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

export const DeleteButtonEdge = ({
 id,
 sourceX,
 sourceY,
 targetX,
 targetY,
 sourcePosition,
 targetPosition,
 style = {},
 markerEnd,
}: any) => {
 const { setEdges } = useReactFlow();
 const [edgePath, labelX, labelY] = getBezierPath({
 sourceX,
 sourceY,
 sourcePosition,
 targetX,
 targetY,
 targetPosition,
 });

 const onEdgeClick = (evt: any) => {
 evt.stopPropagation();
 setEdges((edges) => edges.filter((edge) => edge.id !== id));
 };

 return (
 <>
 <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
 <EdgeLabelRenderer>
 <div
 style={{
 position: 'absolute',
 transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
 fontSize: 12,
 pointerEvents: 'all',
 }}
 className="nodrag nopan"
 >
 <button
 className="w-5 h-5 bg-white dark:bg-[#1a1a24] text-rose-500 rounded-none flex items-center justify-center hover:bg-rose-50/50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10"
 onClick={onEdgeClick}
 title="Remove Connection"
 >
 <X size={10} strokeWidth={3} />
 </button>
 </div>
 </EdgeLabelRenderer>
 </>
 );
};
