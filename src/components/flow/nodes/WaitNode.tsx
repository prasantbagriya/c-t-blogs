import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Trash2 } from 'lucide-react';

export const WaitNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[150px]">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-slate-400" />
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-slate-100 text-slate-600 rounded">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Delay</span>
      </div>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-12 text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
        value={data.duration || 1}
        onChange={(e) => data.onChange('duration', e.target.value)}
      />
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">MIN</span>
    </div>
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-slate-400" />
  </div>
);
