import React, { useState, useEffect, useRef } from 'react';
import { CalendarClock, Plus, Trash2, RefreshCw, Image as ImageIcon, Video, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, getHeaders } from '../../api/common';

export const InstagramScheduler = ({ user, account }: { user: any; account: any }) => {
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ caption: '', type: 'post', scheduledAt: '', mediaFile: null as File | null, mediaPreview: '' });
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchScheduled = async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/instagram/scheduled?accountId=${account.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) setScheduled(data.items || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchScheduled(); }, [account?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(prev => ({ ...prev, mediaFile: file, mediaPreview: URL.createObjectURL(file) }));
  };

  const handleSchedule = async () => {
    if (!form.caption.trim() || !form.scheduledAt || !form.mediaFile) {
      (window as any).showToast?.('Caption, media, and schedule time are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('accountId', account.id);
      fd.append('caption', form.caption);
      fd.append('type', form.type);
      fd.append('scheduledAt', new Date(form.scheduledAt).toISOString());
      fd.append('file', form.mediaFile);

      const res = await fetch(`${API_URL}/instagram/schedule`, {
        method: 'POST',
        headers: { 'Authorization': getHeaders()['Authorization'] || '', 'X-Authorization': getHeaders()['X-Authorization'] || '' },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        (window as any).showToast?.('Post scheduled!', 'success');
        setShowForm(false);
        setForm({ caption: '', type: 'post', scheduledAt: '', mediaFile: null, mediaPreview: '' });
        fetchScheduled();
      } else {
        (window as any).showToast?.(data.error || 'Scheduling failed', 'error');
      }
    } catch (e: any) {
      (window as any).showToast?.(e.message, 'error');
    }
    setSubmitting(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this scheduled post?')) return;
    try {
      const res = await fetch(`${API_URL}/instagram/scheduled/${id}`, {
        method: 'DELETE', headers: getHeaders(), body: JSON.stringify({ accountId: account.id })
      });
      if (res.ok) { setScheduled(prev => prev.filter(s => s.id !== id)); (window as any).showToast?.('Scheduled post cancelled', 'success'); }
    } catch (e) {}
  };

  const minDate = new Date(Date.now() + 10 * 60000).toISOString().slice(0, 16);

  return (
    <div className="h-full overflow-y-auto pt-3 px-3 pb-0 bg-white dark:bg-[#0a0a0f] no-scrollbar">
      <div className="max-w-3xl mx-auto w-full space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-4 shadow-sm">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarClock size={16} className="text-amber-500" /> Content Scheduler
            </h2>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Schedule posts for @{account?.username}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchScheduled} disabled={loading} className="p-2 border border-slate-200 dark:border-white/5 rounded-xl text-slate-400 hover:text-amber-500 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-amber-500/20">
              <Plus size={14} /> Schedule Post
            </button>
          </div>
        </div>

        {/* Schedule Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">New Scheduled Post</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
              </div>

              {/* Type */}
              <div className="flex gap-2">
                {(['post', 'reel', 'story'] as const).map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${form.type === t ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Media Upload */}
              <input ref={fileRef} type="file" accept={form.type === 'reel' ? 'video/mp4' : 'image/jpeg,image/png,image/webp'} onChange={handleFileSelect} className="hidden" />
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-all group">
                {form.mediaPreview ? (
                  form.type === 'reel'
                    ? <video src={form.mediaPreview} className="h-32 mx-auto rounded-lg object-cover" />
                    : <img src={form.mediaPreview} className="h-32 mx-auto rounded-lg object-cover" alt="" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {form.type === 'reel' ? <Video size={24} className="text-amber-400" /> : <ImageIcon size={24} className="text-amber-400" />}
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Click to upload {form.type === 'reel' ? 'video' : 'image'}</span>
                  </div>
                )}
              </div>

              {/* Caption */}
              <textarea value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                placeholder="Write your caption... #hashtags" rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 dark:text-white resize-none" />

              {/* Schedule Time */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  <Clock size={10} className="inline mr-1" /> Schedule Date & Time
                </label>
                <input type="datetime-local" min={minDate} value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleSchedule} disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <CalendarClock size={14} />}
                  {submitting ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scheduled Posts */}
        {loading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-amber-500 animate-spin" /></div>
        ) : scheduled.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#16161d] rounded-2xl border border-slate-200 dark:border-white/5">
            <CalendarClock size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">No scheduled posts</p>
            <p className="text-[10px] text-slate-400 mt-1">Click "Schedule Post" to queue content</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduled.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-4">
                {/* Media thumb */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0">
                  {item.mediaUrl ? (
                    item.type === 'reel'
                      ? <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
                      : <img src={item.mediaUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'reel' ? <Video size={20} className="text-slate-400" /> : <ImageIcon size={20} className="text-slate-400" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{item.caption?.substring(0, 60) || 'No caption'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                      item.type === 'reel' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' :
                      item.type === 'story' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}>{item.type}</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                      <Clock size={9} />
                      {new Date(item.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide ${
                      item.status === 'published' ? 'text-emerald-500' : item.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {item.status === 'published' ? <CheckCircle size={9} /> : item.status === 'failed' ? <AlertCircle size={9} /> : <Clock size={9} />}
                      {item.status || 'Pending'}
                    </span>
                  </div>
                </div>
                {item.status !== 'published' && (
                  <button onClick={() => handleCancel(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
