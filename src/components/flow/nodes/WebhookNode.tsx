import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook as WebhookIcon, Trash2 } from 'lucide-react';

export const WebhookNode = ({ data, isConnectable }: any) => (
  <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[200px]">
    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-cyan-50 text-cyan-600 rounded">
          <WebhookIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Outbound Hook (Logic B)</span>
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
      <p className="text-[8px] text-slate-500 font-medium uppercase tracking-widest">External Event</p>
      <select
        value={data.webhookEvent || 'form_submit'}
        onChange={(e) => data.onChange('webhookEvent', e.target.value)}
        className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
      >
        <option value="form_submit">Website Form Submit</option>
        <option value="order_created">New Order Created</option>
        <option value="ticket_opened">Support Ticket</option>
        <option value="api_trigger">API Endpoint Hit</option>
      </select>
      <div className="p-2 bg-slate-50 dark:bg-[#0f0f13] border border-dashed border-slate-200 dark:border-white/10 rounded">
        <p className="text-[8px] text-slate-400 font-mono break-all">https://api.chatwiz.com/v1/hook/...</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-cyan-500" />
  </div>
);
