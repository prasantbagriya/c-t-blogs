import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CalendarClock, Trash2 } from 'lucide-react';

export const TimeRoutingNode = ({ data, isConnectable }: any) => (
 <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-none border border-amber-500/30 dark:border-amber-500/50 min-w-[240px] -amber-500/5">
 <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-amber-500" />
 <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-500/10">
 <div className="flex items-center gap-2">
 <div className="p-1 bg-amber-50 text-amber-600 rounded-none">
 <CalendarClock className="w-3.5 h-3.5" />
 </div>
 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">Business Hours</span>
 </div>
 <button type="button" onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
 </div>
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <div className="space-y-1">
 <p className="text-[8px] text-slate-500 uppercase font-bold px-1">Start Time</p>
 <input type="time" value={data.startTime || '09:00'} onChange={(e) => data.onChange('startTime', e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none font-bold text-slate-700 dark:text-slate-200" />
 </div>
 <div className="space-y-1">
 <p className="text-[8px] text-slate-500 uppercase font-bold px-1">End Time</p>
 <input type="time" value={data.endTime || '18:00'} onChange={(e) => data.onChange('endTime', e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none font-bold text-slate-700 dark:text-slate-200" />
 </div>
 </div>
 <div className="space-y-1">
 <p className="text-[8px] text-slate-500 uppercase font-bold px-1">Working Days</p>
 <div className="flex gap-1 justify-between px-1">
 {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
 const days = data.days || [1,2,3,4,5,6]; // default Mon-Sat
 const isActive = days.includes(i + 1);
 return (
 <button type="button" key={day} onClick={(e) => {
 e.preventDefault();
 const newDays = isActive ? days.filter((d: number) => d !== i + 1) : [...days, i + 1];
 data.onChange('days', newDays);
 }} className={`w-6 h-6 rounded-none text-[8px] font-bold flex items-center justify-center ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{day[0]}</button>
 )
 })}
 </div>
 </div>
 </div>
 <div className="flex justify-between items-center px-4 pt-4 border-t border-slate-50 dark:border-white/5 -mx-4 mt-2">
 <div className="flex flex-col items-center gap-1 relative">
 <Handle type="source" position={Position.Bottom} id="open" style={{ left: '30%', bottom: '-12px', background: '#10b981' }} className="w-3 h-3 border-2 border-white dark:border-[#16161d]" />
 <span className="text-[7px] font-black text-emerald-500 uppercase">Open</span>
 </div>
 <div className="flex flex-col items-center gap-1 relative">
 <Handle type="source" position={Position.Bottom} id="closed" style={{ left: '70%', bottom: '-12px', background: '#f43f5e' }} className="w-3 h-3 border-2 border-white dark:border-[#16161d]" />
 <span className="text-[7px] font-black text-rose-500 uppercase">Closed</span>
 </div>
 </div>
 </div>
);
