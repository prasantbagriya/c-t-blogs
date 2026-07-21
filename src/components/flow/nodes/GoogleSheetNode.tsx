import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Trash2 } from 'lucide-react';

export const GoogleSheetNode = ({ data, isConnectable }: any) => {
 return (
 <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-none border border-emerald-500/30 dark:border-emerald-500/50 min-w-[240px] -emerald-500/5">
 <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
 <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-500/10">
 <div className="flex items-center gap-2">
 <div className="p-1 bg-emerald-50 text-emerald-600 rounded-none">
 <FileText className="w-3.5 h-3.5" />
 </div>
 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">Google Sheets</span>
 </div>
 <button type="button" onClick={() => data.onDelete(data.id)} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
 </div>
 <div className="space-y-3">
 <div className="space-y-1">
 <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Action</p>
 <select
 value={data.action || 'append'}
 onChange={(e) => data.onChange('action', e.target.value)}
 className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none font-bold"
 >
 <option value="append">Append Row</option>
 <option value="update">Update Row</option>
 </select>
 </div>
 <div className="space-y-1">
 <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Row Data (JSON Mapping)</p>
 <textarea
 placeholder='{"Name": "{{name}}", "Phone": "{{phone}}", "Amount": "{{amount}}"}'
 value={data.mapping || ''}
 onChange={(e) => data.onChange('mapping', e.target.value)}
 rows={4}
 className="w-full text-[9px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none font-mono resize-none"
 />
 <div className="flex flex-wrap gap-1 mt-1">
 <span className="text-[7px] bg-blue-500/10 text-blue-500 px-1 rounded-none cursor-pointer" onClick={() => data.onChange('mapping', (data.mapping || '') + '{{name}}')}>{"{{name}}"}</span>
 <span className="text-[7px] bg-blue-500/10 text-blue-500 px-1 rounded-none cursor-pointer" onClick={() => data.onChange('mapping', (data.mapping || '') + '{{phone}}')}>{"{{phone}}"}</span>
 <span className="text-[7px] bg-blue-500/10 text-blue-500 px-1 rounded-none cursor-pointer" onClick={() => data.onChange('mapping', (data.mapping || '') + '{{amount}}')}>{"{{amount}}"}</span>
 </div>
 </div>
 </div>
 <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
 </div>
 );
};
