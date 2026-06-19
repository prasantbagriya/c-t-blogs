import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MonitorPlay, Trash2 } from 'lucide-react';

export const YouTubeNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-red-500/30 dark:border-red-500/50 min-w-[260px] shadow-lg shadow-red-500/5">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-red-500" />
      
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-red-500/10">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-red-50 text-red-600 rounded">
            <MonitorPlay className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">YouTube API</span>
        </div>
        <button type="button" onClick={() => data.onDelete(data.id)} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Action</p>
          <select 
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
            value={data.action || 'upload_video'}
            onChange={(e) => data.onChange('action', e.target.value)}
          >
            <option value="upload_video">Upload Video (from URL)</option>
            <option value="create_playlist">Create Playlist</option>
          </select>
        </div>

        {data.action === 'upload_video' && (
          <div className="space-y-1">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Video URL Variable</p>
            <input
              className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
              placeholder="{{videoUrl}}"
              value={data.videoUrl || ''}
              onChange={(e) => data.onChange('videoUrl', e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">{data.action === 'upload_video' ? 'Video Title' : 'Playlist Title'}</p>
          <input
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
            placeholder="e.g. Testimonial {{name}}"
            value={data.title || ''}
            onChange={(e) => data.onChange('title', e.target.value)}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-red-500" />
    </div>
  );
};
