import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu, Trash2 } from 'lucide-react';

export const MCPNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[200px]">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-indigo-500" />
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">AI Actions (MCP)</span>
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
      <p className="text-[8px] text-slate-500 font-medium uppercase tracking-widest">Connect CRM/DB</p>
      <select
        value={data.actionType || 'fetch'}
        onChange={(e) => data.onChange('actionType', e.target.value)}
        className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
      >
        <option value="fetch">Fetch Order Status</option>
        <option value="update_lead">Update CRM Lead</option>
        <option value="sheet_row">Add Google Sheet Row</option>
        <option value="custom_api">Custom MCP Query</option>
      </select>
    </div>
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-indigo-500" />
  </div>
);
