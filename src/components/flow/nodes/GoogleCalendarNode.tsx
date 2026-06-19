import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calendar, Trash2, Globe } from 'lucide-react';

export const GoogleCalendarNode = ({ data, isConnectable }: any) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-[#1a1a24] rounded-lg border border-blue-500/30 dark:border-blue-500/50 min-w-[260px] shadow-lg shadow-blue-500/5">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
      
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-500/10">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-50 text-blue-600 rounded">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-wider">Google Calendar</span>
        </div>
        <button type="button" onClick={() => data.onDelete(data.id)} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Action</p>
          <select 
            className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
            value={data.action || 'create_event'}
            onChange={(e) => data.onChange('action', e.target.value)}
          >
            <option value="create_event">Create Event</option>
            <option value="find_slot">Find Free Slot</option>
          </select>
        </div>

        {(!data.action || data.action === 'create_event') && (
          <>
            <div className="space-y-1">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Event Title</p>
              <input
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
                placeholder="e.g. Consultation with {{name}}"
                value={data.eventTitle || ''}
                onChange={(e) => data.onChange('eventTitle', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Start Time (ISO/Text format)</p>
              <input
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
                placeholder="e.g. tomorrow at 10am"
                value={data.startTime || ''}
                onChange={(e) => data.onChange('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Duration (Minutes)</p>
              <input
                type="number"
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
                placeholder="30"
                value={data.duration || '30'}
                onChange={(e) => data.onChange('duration', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold px-1">Attendee Email (Optional)</p>
              <input
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded outline-none"
                placeholder="e.g. {{email}}"
                value={data.attendeeEmail || ''}
                onChange={(e) => data.onChange('attendeeEmail', e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 mt-2 px-1">
              <input
                type="checkbox"
                id={`meet-${data.id}`}
                className="rounded border-slate-300"
                checked={data.generateMeet || false}
                onChange={(e) => data.onChange('generateMeet', e.target.checked)}
              />
              <label htmlFor={`meet-${data.id}`} className="text-[9px] text-slate-600 dark:text-slate-300 font-medium">
                Generate Google Meet Link
              </label>
            </div>
            <p className="text-[7px] text-slate-400 italic px-1 leading-tight mt-1">Available as &#123;&#123;meetLink&#125;&#125; in next nodes.</p>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
    </div>
  );
};
