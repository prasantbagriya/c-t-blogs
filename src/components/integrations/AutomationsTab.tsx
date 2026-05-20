import React from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { db, doc, collection, addDoc, deleteDoc } from '../../api';

interface AutomationsTabProps {
  formData: any;
  setFormData: (d: any) => void;
  templates: any[];
  automations: any[];
  user: any;
  showToast: (m: string, t: any) => void;
}

export const AutomationsTab = ({
  formData,
  setFormData,
  templates,
  automations,
  user,
  showToast
}: AutomationsTabProps) => {
  const addAutomation = async () => {
    try {
      await addDoc(collection(db, 'automations'), {
        uid: user.parentId || user.uid,
        name: `Shopify: ${formData.event} -> ${formData.templateName}`,
        triggerSource: 'shopify',
        event: formData.event,
        templateName: formData.templateName,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      showToast('Automation rule created!', 'success');
    } catch (e: any) {
      showToast('Failed to create automation', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#16161d] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-blue-600" /> New Rule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trigger Event</label>
            <select 
              onChange={(e) => setFormData({...formData, event: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors dark:text-white"
            >
              <option value="">Select Event</option>
              <option value="orders/create">Shopify: New Order</option>
              <option value="orders/updated">Shopify: Order Updated</option>
              <option value="checkouts/create">Shopify: Abandoned Cart</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Template</label>
            <select 
              onChange={(e) => setFormData({...formData, templateName: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors dark:text-white"
            >
              <option value="">Select Template</option>
              {templates.filter(t => t.status === 'APPROVED').map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={addAutomation}
            className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Create Rule
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16161d] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rule Name</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Trigger</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Template</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {automations.map(auto => (
                <tr key={auto.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{auto.name}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase rounded border border-blue-100 dark:border-blue-900/50">{auto.event}</span></td>
                  <td className="px-6 py-4 text-xs text-slate-500">{auto.templateName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteDoc(doc(db, 'automations', auto.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {automations.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400 text-xs italic">No active rules.</div>
          )}
        </div>
      </div>
    </div>
  );
};
