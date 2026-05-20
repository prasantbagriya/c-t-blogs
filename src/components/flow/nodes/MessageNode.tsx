import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Trash2, X, HelpCircle } from 'lucide-react';

const InfoIcon = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle size={8} className="text-slate-400 cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 p-2 bg-slate-800 text-[7px] text-white rounded shadow-xl z-50 leading-tight">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

export const MessageNode = ({ data, isConnectable }: any) => {
  const buttons = data.buttons || [];

  const addButton = () => {
    if (buttons.length < 3) {
      data.onChange('buttons', [...buttons, { id: `btn_${Date.now()}`, label: 'New Button' }]);
    }
  };

  const removeButton = (id: string) => {
    data.onChange('buttons', buttons.filter((b: any) => b.id !== id));
  };

  const updateButton = (id: string, updates: any) => {
    data.onChange('buttons', buttons.map((b: any) => b.id === id ? { ...b, ...updates } : b));
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[220px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-50 text-blue-600 rounded">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Standard Message (Omnichannel)</span>
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
        <div>
          <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-medium">Text Body</p>
          <textarea
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white resize-none font-medium"
            placeholder="Message text..."
            rows={3}
            value={data.message || ''}
            onChange={(e) => data.onChange('message', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Interactive Buttons</p>
            <div className="flex items-center gap-2">
              {buttons.length < 3 && (
                <button
                  onClick={addButton}
                  className="text-[8px] font-medium text-blue-500 uppercase hover:underline"
                >
                  + Add Button
                </button>
              )}
            </div>
          </div>

          {buttons.length > 0 && (
            <div className="flex items-center gap-1.5 py-1 px-2 bg-blue-50/30 dark:bg-blue-500/5 rounded border border-blue-100/50 dark:border-blue-500/10">
              <input
                type="checkbox"
                checked={data.smartBranching !== false}
                onChange={(e) => data.onChange('smartBranching', e.target.checked)}
                className="w-2.5 h-2.5 rounded border-slate-300 text-blue-500"
              />
              <span className="text-[8px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-tight">
                Smart Branching <InfoIcon text="If user TYPES the button text (e.g. 'Price') instead of clicking, the flow still continues. (Case & Emoji Insensitive)" />
              </span>
            </div>
          )}

          <div className="space-y-2">
            {buttons.map((btn: any, idx: number) => (
              <div key={btn.id} className="relative group/btn space-y-1 p-2 bg-slate-50 dark:bg-[#252533] rounded border border-slate-100 dark:border-white/10 transition-all hover:border-blue-500/30">
                <div className="flex items-center gap-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => updateButton(btn.id, { ...btn, label: e.target.value })}
                      className="text-[9px] bg-transparent outline-none dark:text-white font-medium"
                      placeholder="Button label..."
                    />
                    <div className="flex items-center gap-2">
                      <select
                        className="text-[7px] bg-slate-100 dark:bg-white/10 rounded px-1 outline-none font-bold text-slate-500"
                        value={btn.type || 'reply'}
                        onChange={(e) => updateButton(btn.id, { ...btn, type: e.target.value })}
                      >
                        <option value="reply">Reply</option>
                        <option value="payment">💳 Payment</option>
                        <option value="url">🔗 URL</option>
                      </select>
                      {btn.type === 'payment' && <span className="text-[7px] text-emerald-500 font-black animate-pulse uppercase">Auto-Link</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeButton(btn.id)}
                    className="p-1 text-slate-300 hover:text-rose-500"
                  >
                    <X size={10} />
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/10">
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[7px] text-slate-400 font-medium uppercase">Tag:</span>
                    <input
                      type="text"
                      value={btn.tag || ''}
                      onChange={(e) => updateButton(btn.id, { ...btn, tag: e.target.value })}
                      className="flex-1 text-[8px] bg-transparent outline-none text-blue-500 dark:text-blue-400 font-medium"
                      placeholder="e.g. Admission"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-1.5 border-l border-slate-200 dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={btn.hasLink || false}
                      onChange={(e) => updateButton(btn.id, { ...btn, hasLink: e.target.checked })}
                      className="w-2.5 h-2.5 rounded border-slate-300 text-blue-500 cursor-pointer"
                    />
                    <span className="text-[7px] text-slate-400 font-bold uppercase">Link</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 border-l border-slate-200 dark:border-white/10 pl-2">
                    <p className="text-[7px] text-slate-400 font-bold uppercase">Old Click Action:</p>
                    <div className="flex items-center gap-1">
                      <select
                        value={btn.oldClickAction || 'default'}
                        onChange={(e) => updateButton(btn.id, { ...btn, oldClickAction: e.target.value })}
                        className="flex-1 text-[8px] bg-slate-100 dark:bg-white/5 rounded px-1 py-1 outline-none font-bold text-orange-600 cursor-pointer"
                      >
                        <option value="default">Same Flow (Orange)</option>
                        <option value="restart">Restart Flow</option>
                        <option value="switch">Switch Flow...</option>
                      </select>
                      {btn.oldClickAction === 'switch' && (
                        <select
                          value={btn.switchFlowId || ''}
                          onChange={(e) => updateButton(btn.id, { ...btn, switchFlowId: e.target.value })}
                          className="flex-1 text-[8px] bg-slate-100 dark:bg-white/5 rounded px-1 py-1 outline-none font-bold text-orange-600 cursor-pointer"
                        >
                          <option value="">Select Flow...</option>
                          {data.allFlows?.map((f: any) => (
                            <option key={f.id} value={f.id}>{f.name || 'Untitled Flow'}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {btn.hasLink && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Target URL</p>
                    <input
                      type="text"
                      value={btn.url || ''}
                      onChange={(e) => updateButton(btn.id, { ...btn, url: e.target.value })}
                      className="w-full text-[8px] p-1.5 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded outline-none text-blue-600 dark:text-blue-400 font-medium"
                      placeholder="https://..."
                    />
                  </div>
                )}

                <Handle
                  type="source"
                  position={Position.Right}
                  id={btn.id}
                  isConnectable={isConnectable}
                  className="w-2.5 h-2.5 bg-orange-500 border-2 border-white dark:border-[#1a1a24] -right-1.5"
                  style={{ top: '50%' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-medium">Default Exit (Timeout/Mismatch)</p>
          <div className="p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded flex items-center justify-between">
            <span className="text-[9px] text-slate-400 italic">Connected to next step...</span>
            <Handle type="source" position={Position.Right} id="default" isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
