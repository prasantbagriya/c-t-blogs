import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { List, Trash2, Link, X } from 'lucide-react';

export const ListNode = ({ data, isConnectable }: any) => {
  const sections = data.sections || [{ id: Date.now(), title: 'Options', rows: [{ id: Date.now() + 1, title: 'Item 1' }] }];

  const addRow = (sectionId: number) => {
    data.onChange('sections', sections.map((s: any) =>
      s.id === sectionId ? { ...s, rows: [...s.rows, { id: Date.now(), title: 'New Item' }] } : s
    ));
  };

  const updateRow = (sectionId: number, rowId: number, updates: any) => {
    data.onChange('sections', sections.map((s: any) =>
      s.id === sectionId ? { ...s, rows: s.rows.map((r: any) => r.id === rowId ? (typeof updates === 'string' ? { ...r, title: updates } : { ...r, ...updates }) : r) } : s
    ));
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[220px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-400" />
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-50 text-blue-500 rounded">
            <List className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Interactive Menu / List (Omnichannel)</span>
        </div>
        <button type="button" onClick={() => data.onDelete(data.id)} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Header Text</p>
          <input
            placeholder="List header (max 60 chars)..."
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
            value={data.header || ''}
            onChange={(e) => data.onChange('header', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Body Text</p>
          <textarea
            placeholder="Main message body..."
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium resize-none"
            rows={2}
            value={data.message || ''}
            onChange={(e) => data.onChange('message', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          {sections.map((section: any) => (
            <div key={section.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[8px] text-slate-400 uppercase font-medium">Rows</p>
                <button onClick={() => addRow(section.id)} className="text-[8px] text-blue-500 hover:underline">+ Add Row</button>
              </div>
              {section.rows.map((row: any, idx: number) => (
                <div key={row.id} className="relative group space-y-1 p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-lg transition-all hover:border-blue-500/30">
                  <div className="flex items-center gap-1">
                    <input
                      value={row.title}
                      onChange={(e) => updateRow(section.id, row.id, e.target.value)}
                      className="flex-1 text-[9px] bg-transparent outline-none dark:text-white font-medium"
                      placeholder="Row title..."
                    />
                    <div className="flex items-center gap-1.5 px-1.5 border-l border-slate-200 dark:border-white/10">
                      <input
                        type="checkbox"
                        checked={row.leadCapture || false}
                        onChange={(e) => updateRow(section.id, row.id, { leadCapture: e.target.checked })}
                        className="w-2.5 h-2.5 rounded border-slate-300 text-blue-500 cursor-pointer"
                        title="Enable Lead Capture"
                      />
                      <span className="text-[7px] text-slate-400 font-bold uppercase">Lead</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-1.5 border-l border-slate-200 dark:border-white/10">
                      <input
                        type="checkbox"
                        checked={row.hasLink || false}
                        onChange={(e) => updateRow(section.id, row.id, { hasLink: e.target.checked })}
                        className="w-2.5 h-2.5 rounded border-slate-300 text-blue-500 cursor-pointer"
                        title="Attach Website Link"
                      />
                      <span className="text-[7px] text-slate-400 font-bold uppercase">Link</span>
                    </div>
                  </div>

                  {(row.hasLink || row.action === 'url') && (
                    <div className="pt-1.5 border-t border-blue-100 dark:border-blue-500/10 animate-in slide-in-from-top-1">
                      <div className="flex items-center gap-2 p-1.5 bg-blue-50 dark:bg-blue-500/5 rounded border border-blue-200/50 dark:border-blue-500/20">
                        <Link size={10} className="text-blue-500" />
                        <input
                          type="text"
                          value={row.url || ''}
                          onChange={(e) => updateRow(section.id, row.id, { url: e.target.value })}
                          className="flex-1 text-[8px] bg-transparent outline-none dark:text-white placeholder-slate-400 font-medium"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Item Action Selection */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200 dark:border-white/5">
                    <div className="flex-1 flex flex-col gap-1 border-l border-slate-200 dark:border-white/10 pl-2">
                      <p className="text-[7px] text-slate-400 font-bold uppercase">Item Action:</p>
                      <div className="flex items-center gap-1">
                        <select
                          value={row.action || 'reply'}
                          onChange={(e) => updateRow(section.id, row.id, { action: e.target.value })}
                          className="flex-1 text-[8px] bg-slate-100 dark:bg-white/5 rounded px-1 py-1 outline-none font-bold text-blue-600 cursor-pointer"
                        >
                          <option value="reply">Reply (Continue Flow)</option>
                          <option value="url">🔗 Open URL</option>
                          <option value="payment">💳 Collection Payment</option>
                          <option value="switch">↪️ Switch Flow...</option>
                        </select>
                        {row.action === 'switch' && (
                          <select
                            value={row.switchFlowId || ''}
                            onChange={(e) => updateRow(section.id, row.id, { switchFlowId: e.target.value })}
                            className="flex-1 text-[8px] bg-blue-50 dark:bg-blue-900/20 rounded px-1 py-1 outline-none font-bold text-blue-600"
                          >
                            <option value="">Select Flow</option>
                            {(data.allFlows || []).map((f: any) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      {row.action === 'payment' && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[6px] text-emerald-500 font-black animate-pulse uppercase">Payment Link will be generated auto</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {row.leadCapture && (
                    <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-[7px] text-slate-400 font-medium uppercase">Tag:</span>
                        <input
                          type="text"
                          value={row.tag || ''}
                          onChange={(e) => updateRow(section.id, row.id, { tag: e.target.value })}
                          className="flex-1 text-[8px] bg-transparent outline-none dark:text-white font-medium"
                          placeholder="Tag..."
                        />
                      </div>
                      <div className="flex items-center gap-1 border-l border-slate-200 dark:border-white/5 pl-2">
                        <span className="text-[7px] text-slate-400 font-medium uppercase">Pri:</span>
                        {(row.priority === 'low' || row.priority === 'medium' || row.priority === 'high' || row.priority === 'none' || !row.priority) && row.priority !== '' ? (
                          <select
                            value={row.priority || 'medium'}
                            onChange={(e) => updateRow(section.id, row.id, { priority: e.target.value === 'custom' ? '' : e.target.value })}
                            className="text-[8px] bg-transparent outline-none font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Med</option>
                            <option value="high">High</option>
                            <option value="none">None</option>
                            <option value="custom">Custom...</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              autoFocus
                              value={row.priority}
                              onChange={(e) => updateRow(section.id, row.id, { priority: e.target.value })}
                              className="w-12 text-[8px] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/30 rounded px-1 outline-none font-bold text-blue-600 placeholder-slate-400"
                              placeholder="Type..."
                            />
                            <button
                              onClick={() => updateRow(section.id, row.id, { priority: 'medium' })}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${row.id}_primary`}
                    style={{ top: '45%', background: '#3b82f6' }}
                    isConnectable={isConnectable}
                    className="w-2.5 h-2.5 border-2 border-white dark:border-[#1a1a24] -right-1.5"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
