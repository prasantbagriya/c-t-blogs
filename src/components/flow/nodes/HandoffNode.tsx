import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Trash2 } from 'lucide-react';

export const HandoffNode = ({ data, isConnectable }: any) => (
 <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-none border border-orange-500/30 dark:border-orange-500/50 min-w-[220px] -orange-500/5">
 <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-orange-500" />
 <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-orange-500/10">
 <div className="flex items-center gap-2">
 <div className="p-1 bg-orange-50 text-orange-600 rounded-none">
 <User className="w-3.5 h-3.5" />
 </div>
 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">Human Handoff</span>
 </div>
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
 className="p-1 text-slate-300 hover:text-rose-500 "
 >
 <Trash2 size={12} />
 </button>
 </div>
 <div className="space-y-3">
 <div className="p-2 bg-orange-50/50 dark:bg-orange-500/5 rounded-none border border-orange-100/50 dark:border-orange-500/10">
 <p className="text-[9px] text-orange-700 dark:text-orange-300 font-medium leading-relaxed italic">
 "At this stage, AI automation will pause and the visitor will be transferred to a live human agent in your Inbox."
 </p>
 </div>

 <div className="space-y-2">
 <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Assignment Settings</p>
 <select
 value={data.handoffType || 'unassigned'}
 onChange={(e) => data.onChange('handoffType', e.target.value)}
 className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none font-bold text-slate-700 dark:text-slate-200"
 >
 <option value="unassigned">Auto Assign (Round Robin)</option>
 <option value="team">Team / Department</option>
 <option value="specific">Specific Agent</option>
 </select>
 </div>
 </div>
 </div>
);
