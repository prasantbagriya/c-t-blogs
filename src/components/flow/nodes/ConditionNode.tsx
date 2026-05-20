import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Filter, Trash2 } from 'lucide-react';

export const ConditionNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[200px]">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-purple-500" />
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-purple-50 text-purple-600 rounded">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Logic (IF/ELSE)</span>
      </div>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div className="space-y-2">
      <p className="text-[8px] text-slate-500 font-medium uppercase tracking-widest">Condition Match</p>
      <input
        type="text"
        placeholder="If message contains..."
        className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
        value={data.condition || ''}
        onChange={(e) => data.onChange('condition', e.target.value)}
      />
      <div className="flex justify-between items-center px-1">
        <span className="text-[8px] font-medium text-emerald-500 uppercase">TRUE</span>
        <span className="text-[8px] font-medium text-rose-500 uppercase">FALSE</span>
      </div>
    </div>
    <div className="flex justify-between mt-2">
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} isConnectable={isConnectable} className="w-2 h-2 bg-rose-500" />
    </div>
  </div>
);
