import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, Trash2, X } from 'lucide-react';

export const ExternalApiNode = ({ data, isConnectable }: any) => {
  const [params, setParams] = useState<any[]>(data.params || [{ key: 'phone', value: '{{phone}}' }]);

  const updateParam = (index: number, key: string, val: string) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [key]: val };
    setParams(newParams);
    data.onChange('params', newParams);
  };

  const addParam = () => setParams([...params, { key: '', value: '' }]);
  const removeParam = (index: number) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
    data.onChange('params', newParams);
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-cyan-500/30 dark:border-cyan-500/50 min-w-[260px] shadow-lg shadow-cyan-500/5">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-cyan-500" />
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-cyan-50 text-cyan-600 rounded">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">External API Call</span>
        </div>
        <button type="button" onClick={() => data.onDelete(data.id)} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Receiver URL (Their Platform)</p>
          <input
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none font-mono"
            placeholder="https://api.platform.com/activate"
            value={data.webhookUrl || ''}
            onChange={(e) => data.onChange('webhookUrl', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Data to Send</p>
            <button onClick={addParam} className="text-[8px] text-blue-500 font-bold hover:underline">+ Add Field</button>
          </div>
          <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
            {params.map((p, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  placeholder="Key"
                  className="flex-1 text-[9px] p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded outline-none"
                  value={p.key}
                  onChange={(e) => updateParam(i, 'key', e.target.value)}
                />
                <input
                  placeholder="Value"
                  className="flex-1 text-[9px] p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded outline-none"
                  value={p.value}
                  onChange={(e) => updateParam(i, 'value', e.target.value)}
                />
                <button onClick={() => removeParam(i)} className="text-slate-300 hover:text-rose-500"><X size={10} /></button>
              </div>
            ))}
          </div>
          <p className="text-[7px] text-slate-400 italic px-1 leading-tight">Use variables like &#123;&#123;phone&#125;&#125; or &#123;&#123;amount&#125;&#125; to send dynamic data.</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-cyan-500" />
    </div>
  );
};
