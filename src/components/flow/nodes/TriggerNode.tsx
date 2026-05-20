import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Trash2, HelpCircle } from 'lucide-react';

const InfoIcon = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle size={8} className="text-slate-400 cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 p-2 bg-slate-800 text-[7px] text-white rounded shadow-xl z-50 leading-tight">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

export const TriggerNode = ({ data, isConnectable }: any) => {
  const keywords = data.keywords || [];

  const addKeyword = () => {
    data.onChange('keywords', [...keywords, '']);
  };

  const removeKeyword = (idx: number) => {
    data.onChange('keywords', keywords.filter((_: any, i: number) => i !== idx));
  };

  const updateKeyword = (idx: number, val: string) => {
    data.onChange('keywords', keywords.map((v: any, i: number) => i === idx ? val : v));
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-slate-200 dark:border-white/5 min-w-[200px]">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-50 text-amber-600 rounded">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Inbound Trigger</span>
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
          <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mb-1">Channel Source</p>
          <select
            value={data.platform || 'all'}
            onChange={(e) => data.onChange('platform', e.target.value)}
            className="w-full text-[10px] p-2 bg-blue-50 dark:bg-[#1a1a24] border border-blue-100 dark:border-blue-500/20 rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer font-medium"
          >
            <option value="all" className="bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white font-medium">All Channels (Mix)</option>
            <option value="whatsapp" className="bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white font-medium">WhatsApp Only</option>
            <option value="widget" className="bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white font-medium">Website Only</option>
            <option value="instagram" className="bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white font-medium">Instagram Only</option>
          </select>
        </div>

        <div>
          <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mb-1">Trigger Mode</p>
          <select
            value={data.triggerType || 'Any Message'}
            onChange={(e) => data.onChange('triggerType', e.target.value)}
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white cursor-pointer font-medium"
          >
            <option value="Any Message">Any Message (Text/Emoji)</option>
            <option value="Keywords">Specific Keywords / Symbols</option>
            <option value="Image">When User Sends Image</option>
            <option value="Video">When User Sends Video</option>
            <option value="Document">When User Sends Document</option>
            <option value="Audio">When User Sends Audio/Voice</option>
            <option value="Location">When User Sends Location</option>
            <option value="Contact">When User Sends Contact</option>
            <option value="Story Mention">Instagram Story Mention</option>
            <option value="Comment Reply">Instagram Comment Reply</option>
          </select>
        </div>

        {data.triggerType === 'Keywords' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium mb-1">
                  Logic <InfoIcon text="Match ANY: At least one word matches. Match ALL: Every word must be present. Exclude: Triggers if words are NOT found." />
                </p>
                <select
                  value={data.logicType || 'or'}
                  onChange={(e) => data.onChange('logicType', e.target.value)}
                  className="w-full text-[9px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
                >
                  <option value="or">Match ANY word</option>
                  <option value="and">Match ALL words</option>
                  <option value="not">Exclude these words</option>
                </select>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium mb-1">
                  Match Type <InfoIcon text="Smart Match: 'hii👋!!!' will match your keyword 'hii' automatically. Exact: Perfect match. Contains: Match in sentence. (Case-Insensitive)" />
                </p>
                <select
                  value={data.matchType || 'exact'}
                  onChange={(e) => data.onChange('matchType', e.target.value)}
                  className="w-full text-[9px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
                >
                  <option value="exact">Exact</option>
                  <option value="contains">Contains</option>
                  <option value="flexible">Smart</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Trigger Words List</p>
                <button
                  onClick={addKeyword}
                  className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[8px] font-medium uppercase hover:bg-blue-500 hover:text-white transition-all"
                >
                  + Add New Word
                </button>
              </div>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                {keywords.map((kw: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <input
                      type="text"
                      value={kw}
                      onChange={(e) => updateKeyword(idx, e.target.value)}
                      placeholder="Enter word..."
                      className="flex-1 text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none dark:text-white font-medium"
                    />
                    <button
                      onClick={() => removeKeyword(idx)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <div className="text-center py-4 border border-dashed border-slate-200 dark:border-white/5 rounded-lg">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">No words added</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-medium">Trigger Connection</p>
          <div className="p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded flex items-center justify-between">
            <span className="text-[9px] text-slate-400 italic">Connected to first step...</span>
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
