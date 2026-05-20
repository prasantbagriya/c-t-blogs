import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MapPin, Trash2 } from 'lucide-react';

export const AskLocationNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-rose-500/30 dark:border-rose-500/50 min-w-[220px] shadow-lg shadow-rose-500/5">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-rose-500" />
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-rose-500/10">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-rose-50 text-rose-600 rounded">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">Ask Location</span>
      </div>
      <button type="button" onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
    </div>
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[8px] text-slate-500 uppercase font-bold px-1">Prompt Message</p>
        <textarea rows={2} value={data.message || 'Please share your location by tapping the 📎 attachment icon and selecting Location.'} onChange={(e) => data.onChange('message', e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none resize-none font-medium text-slate-700 dark:text-slate-200" />
      </div>
    </div>
    <div className="flex justify-center items-center px-4 pt-4 border-t border-slate-50 dark:border-white/5 -mx-4 mt-2">
      <div className="flex flex-col items-center gap-1 relative">
        <Handle type="source" position={Position.Bottom} id="received" style={{ left: '50%', bottom: '-12px', background: '#3b82f6' }} className="w-3 h-3 border-2 border-white dark:border-[#16161d]" />
        <span className="text-[7px] font-black text-blue-500 uppercase">Location Received</span>
      </div>
    </div>
  </div>
);
