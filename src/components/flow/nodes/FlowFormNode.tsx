import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Trash2, Plus } from 'lucide-react';
import { db, collection, query, where, onSnapshot } from '../../../api';

export const FlowFormNode = ({ data, isConnectable }: any) => {
 const [approvedFlows, setApprovedFlows] = useState<any[]>([]);

 useEffect(() => {
 const constraints = [];
 if (data.userRole !== 'admin') {
 constraints.push(where('uid', '==', data.parentId || data.userId));
 }
 if (data.whatsappAccountId) {
 constraints.push(where('whatsappAccountId', '==', data.whatsappAccountId));
 }
 
 const q = query(collection(db, 'whatsapp_flows'), ...constraints);
 const unsubscribe = onSnapshot(q, (snapshot) => {
 setApprovedFlows(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
 });
 return () => unsubscribe();
 }, [data.userId, data.parentId, data.userRole, data.whatsappAccountId]);

 return (
 <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-none border border-slate-200 dark:border-white/5 min-w-[220px]">
 <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
 <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
 <div className="flex items-center gap-2">
 <div className="p-1 bg-emerald-50 text-emerald-600 rounded-none">
 <Sparkles className="w-3.5 h-3.5" />
 </div>
 <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Interactive Flow</span>
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 window.dispatchEvent(new CustomEvent('flow-auto-save', { detail: { target: 'flows' } }));
 }}
 className="p-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-none "
 title="Create New Flow"
 >
 <Plus size={10} />
 </button>
 </div>
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
 className="p-1 text-slate-300 hover:text-rose-500 "
 >
 <Trash2 size={12} />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1 mb-1">Select from Library</p>
 <select
 value={data.flowId || ''}
 onChange={(e) => data.onChange('flowId', e.target.value)}
 className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none font-bold"
 >
 <option value="">Choose flow...</option>
 {approvedFlows.map(f => (
 <option key={f.id} value={f.id}>{f.name}</option>
 ))}
 </select>
 </div>
 </div>
 <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
 </div>
 );
};
