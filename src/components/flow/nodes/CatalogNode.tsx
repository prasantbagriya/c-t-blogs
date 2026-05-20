import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShoppingCart, Trash2 } from 'lucide-react';

export const CatalogNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[200px]">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-orange-500" />
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-orange-50 text-orange-600 rounded">
          <ShoppingCart className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Send Catalog</span>
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
      <p className="text-[8px] text-slate-500 font-medium uppercase tracking-widest">Select Catalog</p>
      <div className="p-3 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded flex items-center justify-center text-[10px] text-slate-400 font-medium">
        FB_CATALOG_MAIN_01
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-orange-500" />
  </div>
);
