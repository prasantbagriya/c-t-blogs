import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Trash2 } from 'lucide-react';

export const CRMUpdateNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-purple-500/30 dark:border-purple-500/50 min-w-[240px] shadow-lg shadow-purple-500/5">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-purple-500" />
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-500/10">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-purple-50 text-purple-600 rounded">
          <Database className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">CRM Update</span>
      </div>
      <button type="button" onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
    </div>
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[8px] text-slate-500 uppercase font-bold px-1">CRM Provider</p>
        <select value={data.provider || 'hubspot'} onChange={(e) => data.onChange('provider', e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-bold text-slate-700 dark:text-slate-200">
          <option value="hubspot">HubSpot</option>
          <option value="zoho">Zoho CRM</option>
          <option value="salesforce">Salesforce</option>
        </select>
      </div>
      <div className="space-y-1">
        <p className="text-[8px] text-slate-500 uppercase font-bold px-1">API Key / Token</p>
        <input type="password" value={data.apiKey || ''} onChange={(e) => data.onChange('apiKey', e.target.value)} placeholder="Enter API Key" className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none text-slate-700 dark:text-slate-200 font-mono" />
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-purple-500" />
  </div>
);
