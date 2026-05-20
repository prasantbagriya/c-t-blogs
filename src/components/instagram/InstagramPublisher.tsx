import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Video, Send, Plus, X, Globe, Sparkles, Heart, MessageCircle, Upload, CheckCircle, AlertCircle, Loader, LayoutGrid, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, getHeaders } from '../../api/common';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export const InstagramPublisher = ({ user, account }: { user: any, account: any }) => {
  const [caption, setCaption] = useState('');
  const [type, setType] = useState<'post' | 'reel' | 'story'>('post');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = type === 'reel' ? 'video/mp4,video/quicktime' : 'image/jpeg,image/png,image/webp';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      (window as any).showToast?.('File size must be under 100MB.', 'error');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (type === 'reel' && !isVideo) {
      (window as any).showToast?.('Reels require a video file (MP4).', 'error');
      return;
    }
    if ((type === 'post' || type === 'story') && !isImage) {
      (window as any).showToast?.('Posts and Stories require an image file.', 'error');
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreviewUrl(url);
    setPublishStatus('idle');
  };

  const clearMedia = () => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaFile(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiRewrite = async () => {
    if (!caption.trim()) {
      (window as any).showToast?.('Write a caption first to rewrite it.', 'error');
      return;
    }
    setIsRewriting(true);
    try {
      const res = await fetch(`${API_URL}/ai/rewrite-caption`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ caption, type })
      });
      const data = await res.json();
      if (res.ok && data.caption) {
        setCaption(data.caption);
        (window as any).showToast?.('Caption improved by AI!', 'success');
      } else {
        (window as any).showToast?.(data.error || 'AI rewrite failed.', 'error');
      }
    } catch (e: any) {
      (window as any).showToast?.(e.message, 'error');
    } finally {
      setIsRewriting(false);
    }
  };

  const handlePublish = async () => {
    if (!account?.id) {
      (window as any).showToast?.('No Instagram account selected.', 'error');
      return;
    }
    if (!mediaFile) {
      (window as any).showToast?.('Please select a media file to upload.', 'error');
      return;
    }
    if (!caption.trim()) {
      (window as any).showToast?.('Please write a caption.', 'error');
      return;
    }

    setIsPublishing(true);
    setPublishStatus('idle');
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('accountId', account.id);
      formData.append('type', type);
      formData.append('caption', caption);

      const res = await fetch(`${API_URL}/instagram/publish`, {
        method: 'POST',
        headers: {
          'Authorization': getHeaders()['Authorization'] || '',
          'X-Authorization': getHeaders()['X-Authorization'] || ''
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPublishStatus('success');
        setStatusMessage(data.message || 'Content published to Instagram successfully!');
        (window as any).showToast?.('Published to Instagram! 🎉', 'success');
        setCaption('');
        clearMedia();
      } else {
        setPublishStatus('error');
        setStatusMessage(data.error || 'Publishing failed. Please try again.');
        (window as any).showToast?.(data.error || 'Publishing failed.', 'error');
      }
    } catch (e: any) {
      setPublishStatus('error');
      setStatusMessage(e.message || 'Network error. Please try again.');
      (window as any).showToast?.(e.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <div className="h-full overflow-y-auto pt-3 px-3 pb-0 bg-white dark:bg-[#0a0a0f] no-scrollbar">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-5 gap-3 max-w-6xl">

        {/* Composer */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-5 sm:p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={16} className="text-pink-500" /> Create Content
            </h3>

            {/* Content Type Switcher */}
            <div className="flex gap-2 mb-6">
              {(['post', 'reel', 'story'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); clearMedia(); }}
                  className={`flex-1 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    type === t
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-pink-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Upload Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {mediaPreviewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-square bg-black"
                  >
                    {isVideo ? (
                      <video
                        src={mediaPreviewUrl}
                        className="w-full h-full object-contain"
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={mediaPreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      onClick={clearMedia}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded-lg text-white text-[9px] font-bold uppercase">
                      {mediaFile?.name.substring(0, 20)}{(mediaFile?.name.length || 0) > 20 ? '...' : ''}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-white dark:bg-[#1a1a24] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-100 dark:border-white/5 shadow-sm">
                      {type === 'reel' ? (
                        <Video size={24} className="text-pink-500" />
                      ) : (
                        <Upload size={24} className="text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      Click to upload {type === 'reel' ? 'video' : 'image'}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1.5 uppercase tracking-wider">
                      {type === 'reel' ? 'MP4 • Max 100MB' : 'JPEG, PNG, WebP • Max 100MB'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Caption */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write something engaging... #hashtags"
                  rows={4}
                  className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white resize-none placeholder:text-slate-400"
                />
                <div className="flex justify-end">
                  <span className="text-[9px] text-slate-400 font-mono">{caption.length}/2200</span>
                </div>
              </div>

              {/* AI Rewrite */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-tight text-emerald-700 dark:text-emerald-400">AI Caption Rewrite</h4>
                    <p className="text-[8px] text-emerald-600/70 font-medium">Optimize for maximum engagement</p>
                  </div>
                </div>
                <button
                  onClick={handleAiRewrite}
                  disabled={isRewriting || !caption.trim()}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-bold uppercase hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isRewriting ? <Loader size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  {isRewriting ? 'Rewriting...' : 'Improve'}
                </button>
              </div>
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {publishStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-xl flex items-start gap-3 text-xs font-medium ${
                    publishStatus === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                  }`}
                >
                  {publishStatus === 'success' ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                  {statusMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing || !mediaFile || !caption.trim()}
              className="w-full mt-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isPublishing ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish to Instagram
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Phone Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-0">
             <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                   <LayoutGrid size={14} className="text-slate-400" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instagram Preview</h4>
                </div>

                <div className="flex gap-3">
                   <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-yellow-500 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                      {account?.profilePicture ? (
                        <img src={account.profilePicture} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-white" />
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">@{account?.username || 'username'}</span>
                         <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">now</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {caption || 'Your caption will appear here...'}
                      </p>
                      
                      {mediaPreviewUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 aspect-square">
                           {isVideo ? (
                             <video src={mediaPreviewUrl} className="w-full h-full object-cover" muted autoPlay loop />
                           ) : (
                             <img src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                           )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <Heart size={14} />
                            <span className="text-[10px] font-black">0</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <MessageCircle size={14} />
                            <span className="text-[10px] font-black">0</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <Send size={14} />
                            <span className="text-[10px] font-black">0</span>
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
