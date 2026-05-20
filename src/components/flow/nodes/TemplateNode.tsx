import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Trash2, Plus, X } from 'lucide-react';
import { db, collection, query, where, onSnapshot } from '../../../api';

export const TemplateNode = ({ data, isConnectable }: any) => {
  const [approvedTemplates, setApprovedTemplates] = useState<any[]>([]);
  const params = data.params || [];

  useEffect(() => {
    // Fetch only APPROVED templates for the dropdown
    const constraints = [
      where('status', '==', 'APPROVED')
    ];
    
    if (data.userRole !== 'admin') {
      constraints.push(where('uid', '==', data.parentId || data.userId));
    }

    if (data.whatsappAccountId) {
      constraints.push(where('whatsappAccountId', '==', data.whatsappAccountId));
    }

    const q = query(collection(db, 'templates'), ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApprovedTemplates(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [data.userId, data.parentId, data.userRole, data.whatsappAccountId]);

  const addParam = () => {
    data.onChange('params', [...params, { id: Date.now(), value: '' }]);
  };

  const removeParam = (id: number) => {
    data.onChange('params', params.filter((p: any) => p.id !== id));
  };

  const updateParam = (id: number, value: string) => {
    data.onChange('params', params.map((p: any) => p.id === id ? { ...p, value } : p));
  };

  const handleCreateNew = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('flow-auto-save', { detail: { target: 'templates' } }));
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[220px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Platform Template (WA/IG)</span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Approved Templates</p>
            <button
              onClick={handleCreateNew}
              className="p-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded hover:bg-blue-100 transition-all shadow-sm"
              title="Create New Template"
            >
              <Plus size={10} />
            </button>
          </div>
          <select
            value={data.templateName || ''}
            onChange={(e) => data.onChange('templateName', e.target.value)}
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg outline-none font-bold"
          >
            <option value="">Choose template...</option>
            {approvedTemplates.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
          {approvedTemplates.length === 0 && (
            <p className="text-[7px] text-rose-500 mt-1 px-1 italic">No approved templates found. Click + to create one.</p>
          )}
        </div>

        {data.templateName && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-medium">Variables (Params)</p>
              <button
                onClick={addParam}
                className="text-[8px] font-medium text-blue-500 uppercase hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-1">
              {params.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-1">
                  <span className="text-[8px] text-slate-400 font-mono">#{i + 1}</span>
                  <input
                    type="text"
                    value={p.value}
                    onChange={(e) => updateParam(p.id, e.target.value)}
                    className="flex-1 text-[9px] p-1.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
                    placeholder="Variable value..."
                  />
                  <button onClick={() => removeParam(p.id)} className="p-1 text-slate-300 hover:text-rose-500">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-emerald-500" />
    </div>
  );
};
