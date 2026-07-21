import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Video, Trash2 } from 'lucide-react';

export const VideoNode = ({ data, isConnectable }: any) => (
 <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-none border border-slate-200 dark:border-white/5 min-w-[220px]">
 <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
 <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
 <div className="flex items-center gap-2">
 <div className="p-1 bg-purple-50 text-purple-600 rounded-none">
 <Video className="w-3.5 h-3.5" />
 </div>
 <span className="text-[10px] font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Send Video (Omnichannel)</span>
 </div>
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); data.onDelete(data.id); }}
 className="p-1 text-slate-300 hover:text-rose-500 "
 >
 <Trash2 size={12} />
 </button>
 </div>

 <div className="space-y-3">
 <div>
 <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-medium">Video URL (Direct MP4)</p>
 <input
 className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none dark:text-white font-medium"
 placeholder="https://example.com/video.mp4"
 value={data.videoUrl || ''}
 onChange={(e) => data.onChange('videoUrl', e.target.value)}
 />
 </div>
 <div>
 <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-medium">Caption (Optional)</p>
 <textarea
 className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none outline-none dark:text-white resize-none font-medium"
 placeholder="Caption text..."
 rows={2}
 value={data.message || ''}
 onChange={(e) => data.onChange('message', e.target.value)}
 />
 </div>
 </div>
 <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
 </div>
);
