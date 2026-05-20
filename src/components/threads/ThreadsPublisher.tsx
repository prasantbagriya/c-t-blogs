import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Video, X, Sparkles, RefreshCw, CheckCircle2, AlertCircle, LayoutGrid, Type, Heart, MessageCircle, Repeat } from 'lucide-react';
import { Threads } from '../common/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, getHeaders, uploadFile, getFileUrl } from '../../api/common';

export const ThreadsPublisher = ({ user, account }: { user: any; account: any }) => {
  const [text, setText] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newUrls = [...mediaUrls];
      for (let i = 0; i < files.length; i++) {
        if (newUrls.length >= 10) break; // Threads limit
        const data = await uploadFile(files[i]);
        if (data.success) {
          const relativeUrl = getFileUrl(data.url);
          const absoluteUrl = relativeUrl.startsWith('http') 
            ? relativeUrl 
            : `${window.location.origin}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
          newUrls.push(absoluteUrl);
        }
      }
      setMediaUrls(newUrls);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!text.trim() && mediaUrls.length === 0) {
      setError('Please add some text or upload media.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/threads/publish`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          accountId: account.id,
          text,
          mediaUrls,
          isCarousel: mediaUrls.length > 1
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setText('');
        setMediaUrls([]);
      } else {
        setError(data.error || 'Failed to publish to Threads');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="pt-3 px-3 pb-20 bg-slate-50 dark:bg-[#0f0f13] no-scrollbar">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-5 gap-3">
        
        {/* Composer */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Thread</h3>
              <div className="flex gap-2">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-2 rounded-lg border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:text-black dark:hover:text-white transition-all"
                   title="Upload Media (Images/Videos)"
                 >
                   {uploading ? <RefreshCw size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                 </button>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
            />

            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's happening? Share your thoughts..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white min-h-[140px] resize-none font-medium"
            />

            {mediaUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 group">
                    {url.toLowerCase().match(/\.(mp4|mov|webm)$/) ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-black/20">
                         <Video size={20} />
                      </div>
                    ) : (
                      <img src={url} className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 text-[10px] font-bold">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={14} />
                Published Successfully!
              </div>
            )}

            <button 
              onClick={handlePublish}
              disabled={loading || (!text.trim() && mediaUrls.length === 0)}
              className="w-full mt-4 py-3.5 bg-black dark:bg-white dark:text-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? 'Publishing...' : 'Post Thread'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-0">
             <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                   <LayoutGrid size={14} className="text-slate-400" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview</h4>
                </div>
                <div className="flex gap-3">
                   <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                      {account?.profilePicture ? (
                        <img src={account.profilePicture} className="w-full h-full object-cover" />
                      ) : (
                        <Threads size={20} className="text-slate-400" />
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-xs font-black text-slate-900 dark:text-white truncate">@{account?.username || 'username'}</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">now</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {text || 'Your thread content will appear here...'}
                      </p>
                      
                      {mediaUrls.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                           {mediaUrls.map((url, i) => (
                             <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                                {url.toLowerCase().match(/\.(mp4|mov|webm)$/) ? (
                                   <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                                      <Video size={16} />
                                      <span className="text-[8px] uppercase font-black tracking-widest">Video</span>
                                   </div>
                                ) : (
                                   <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                )}
                             </div>
                           ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <Heart size={14} />
                            <span className="text-[10px] font-bold">0</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <MessageCircle size={14} />
                            <span className="text-[10px] font-bold">0</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <Repeat size={14} />
                            <span className="text-[10px] font-bold">0</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
