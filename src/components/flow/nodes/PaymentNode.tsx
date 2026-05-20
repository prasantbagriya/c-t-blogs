import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CreditCard, Trash2 } from 'lucide-react';

export const PaymentNode = ({ data, isConnectable }: any) => (
  <>
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-blue-500/30 dark:border-blue-500/50 min-w-[220px] shadow-lg shadow-blue-500/5">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-500/10">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-50 text-blue-600 rounded">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">Razorpay Payment</span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Payment Type</p>
          <select
            value={data.paymentType || 'one_time'}
            onChange={(e) => data.onChange('paymentType', e.target.value)}
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-bold"
          >
            <option value="one_time">One-time Payment</option>
            <option value="dynamic">Dynamic (from Variable)</option>
            <option value="subscription">Subscription (Plan)</option>
          </select>
        </div>

        {data.paymentType === 'subscription' ? (
          <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Plan ID (from Razorpay)</p>
            <input
              type="text"
              placeholder="plan_Kxxxxxxxxxxxx"
              value={data.planId || ''}
              onChange={(e) => data.onChange('planId', e.target.value)}
              className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-mono"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">
                {data.paymentType === 'dynamic' ? 'Variable Name' : 'Amount'}
              </p>
              <input
                type={data.paymentType === 'dynamic' ? 'text' : 'number'}
                placeholder={data.paymentType === 'dynamic' ? '{{total_price}}' : '0.00'}
                value={data.amount || ''}
                onChange={(e) => data.onChange('amount', e.target.value)}
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-bold"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Currency</p>
              <select
                value={data.currency || 'INR'}
                onChange={(e) => data.onChange('currency', e.target.value)}
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-bold"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Item Description</p>
          <input
            type="text"
            placeholder="e.g. Order #123"
            value={data.description || ''}
            onChange={(e) => data.onChange('description', e.target.value)}
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-medium"
          />
        </div>

        <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Metadata (Product Variants)</p>
            <button
              onClick={() => {
                const meta = data.metadata || [];
                data.onChange('metadata', [...meta, { key: '', value: '' }]);
              }}
              className="text-[8px] text-blue-500 font-bold hover:underline"
            >
              + Add Data
            </button>
          </div>
          <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">
            {(data.metadata || []).map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  placeholder="SKU/ID"
                  className="flex-1 text-[9px] p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded outline-none"
                  value={m.key}
                  onChange={(e) => {
                    const meta = [...data.metadata];
                    meta[i].key = e.target.value;
                    data.onChange('metadata', meta);
                  }}
                />
                <input
                  placeholder="Value"
                  className="flex-1 text-[9px] p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded outline-none"
                  value={m.value}
                  onChange={(e) => {
                    const meta = [...data.metadata];
                    meta[i].value = e.target.value;
                    data.onChange('metadata', meta);
                  }}
                />
                <button
                  onClick={() => {
                    const meta = data.metadata.filter((_: any, idx: number) => idx !== i);
                    data.onChange('metadata', meta);
                  }}
                  className="p-1 text-slate-300 hover:text-rose-500"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
  </>
);
