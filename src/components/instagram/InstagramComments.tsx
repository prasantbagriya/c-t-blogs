import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  MessageSquare, 
  Send, 
  User, 
  Calendar, 
  ExternalLink, 
  ChevronLeft, 
  MessageCircle, 
  Shield, 
  X, 
  Trash2, 
  Plus, 
  AlertTriangle,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Paperclip,
  Loader2,
  ChevronRight,
  Heart,
  Eye,
  EyeOff
} from 'lucide-react';
import { API_URL, getHeaders, db, updateDoc, uploadFile, getFileUrl, query, where, onSnapshot, setDoc, collection } from '../../api';
import { motion, AnimatePresence } from 'motion/react';

export const InstagramComments = ({ user, account }: { user: any, account: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // UI State
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [showGuard, setShowGuard] = useState(false);
  const [showAutoManager, setShowAutoManager] = useState(false);

  // Automation State
  const [keywords, setKeywords] = useState<string[]>(account?.keyword_filters || []);
  const [autoDelete, setAutoDelete] = useState(account?.auto_delete_enabled || false);
  const [newKeyword, setNewKeyword] = useState('');

  const [autoReplyText, setAutoReplyText] = useState('');
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(false);
  const [autoDmText, setAutoDmText] = useState('');
  const [isAutoDmEnabled, setIsAutoDmEnabled] = useState(false);
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [dmAttachmentUrl, setDmAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    if (!account?.id) return;
    setLoadingPosts(true);
    try {
      const res = await fetch(`${API_URL}/instagram/posts?accountId=${account.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
        if (data.posts?.length > 0 && !selectedPost) setSelectedPost(data.posts[0]);
      }
    } catch (e) { console.error(e); } finally { setLoadingPosts(false); }
  };

  const fetchComments = async (postId: string) => {
    if (!account?.id || !postId) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`${API_URL}/instagram/comments?accountId=${account.id}&postId=${postId}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        const fetchedComments = data.comments || [];
        setComments(fetchedComments);

        // IG Spam Scanner
        if (keywords.length > 0) {
           for (const comment of fetchedComments) {
              const matchedWord = keywords.find(word => comment.text.toLowerCase().includes(word.toLowerCase()));
              if (matchedWord) {
                 const spamId = `spam_ig_${comment.id}`;
                 await setDoc('instagram_spam', spamId, {
                    accountId: account.id,
                    mediaId: postId,
                    commentId: comment.id,
                    text: comment.text,
                    username: comment.username,
                    timestamp: comment.timestamp,
                    matched_keyword: matchedWord,
                    status: autoDelete ? 'deleted' : 'flagged'
                 });

                 if (autoDelete) {
                    await fetch(`${API_URL}/instagram/comments/${comment.id}?accountId=${account.id}`, {
                       method: 'DELETE',
                       headers: getHeaders()
                    });
                    setComments(prev => prev.filter(c => c.id !== comment.id));
                 }
              }
           }
        }
      }
    } catch (e) { console.error(e); } finally { setLoadingComments(false); }
  };

  useEffect(() => { fetchPosts(); }, [account]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'chat_flows_instagram'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snap: any) => {
       setFlows(snap.docs.map((d: any) => d.data()));
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
      setAutoReplyText(selectedPost.auto_reply_text || '');
      setIsAutoReplyEnabled(selectedPost.auto_reply_enabled || false);
      setAutoDmText(selectedPost.auto_dm_text || '');
      setIsAutoDmEnabled(selectedPost.auto_dm_enabled || false);
      setTriggerKeyword(selectedPost.trigger_keyword || '');
      setDmAttachmentUrl(selectedPost.dm_attachment_url || '');
      setSelectedFlowId(selectedPost.continuity_flow_id || '');
    }
  }, [selectedPost]);

  const toggleAutoDelete = async () => {
    const newVal = !autoDelete;
    setAutoDelete(newVal);
    if (!account?.id) return;
    try {
      await updateDoc(`instagram_accounts/${account.id}`, { auto_delete_enabled: newVal });
      (window as any).showToast(newVal ? "IG Auto-delete active" : "IG Auto-delete paused", "success");
    } catch (e) { (window as any).showToast("Update failed", "error"); }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    const updated = [...keywords, newKeyword.trim().toLowerCase()];
    setKeywords(updated);
    setNewKeyword('');
    await updateDoc(`instagram_accounts/${account.id}`, { keyword_filters: updated });
    (window as any).showToast("IG Filter added", "success");
  };

  const handleRemoveKeyword = async (word: string) => {
    const updated = keywords.filter(k => k !== word);
    setKeywords(updated);
    await updateDoc(`instagram_accounts/${account.id}`, { keyword_filters: updated });
  };

  const handleSaveAutomation = async () => {
    if (!selectedPost) return;
    try {
      await updateDoc(`instagram_posts/${selectedPost.id}`, {
        postId: selectedPost.id,
        accountId: account.id,
        auto_reply_enabled: isAutoReplyEnabled,
        auto_reply_text: autoReplyText,
        auto_dm_enabled: isAutoDmEnabled,
        auto_dm_text: autoDmText,
        trigger_keyword: triggerKeyword.trim().toLowerCase(),
        dm_attachment_url: dmAttachmentUrl.trim(),
        continuity_flow_id: selectedFlowId,
        updatedAt: new Date().toISOString()
      });
      setPosts(posts.map(p => p.id === selectedPost.id ? { 
        ...p, 
        auto_reply_enabled: isAutoReplyEnabled, 
        auto_reply_text: autoReplyText, 
        auto_dm_enabled: isAutoDmEnabled, 
        auto_dm_text: autoDmText, 
        trigger_keyword: triggerKeyword.trim().toLowerCase(), 
        dm_attachment_url: dmAttachmentUrl.trim(),
        continuity_flow_id: selectedFlowId
      } : p));
      (window as any).showToast("IG Automation saved", "success");
      setShowAutoManager(false);
    } catch (e) { (window as any).showToast("Save failed", "error"); }
  };

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="h-full flex bg-white dark:bg-[#050505] overflow-hidden relative">
      {/* Sidebar - Recent Posts */}
      <div className={cn(
        "w-full sm:w-80 border-r border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-black/20 transition-all",
        view === 'chat' ? 'hidden sm:flex' : 'flex'
      )}>
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instagram Feed</h3>
          <div className="flex items-center gap-1.5">
             <button onClick={() => setShowGuard(!showGuard)} className={cn("p-2 rounded-xl transition-all", showGuard ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "text-slate-400 hover:bg-white dark:hover:bg-white/5")}><ShieldAlert size={15} /></button>
             <button onClick={fetchPosts} className="p-2 text-slate-400 hover:text-pink-500"><RefreshCw size={15} className={loadingPosts ? 'animate-spin' : ''} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {posts.length === 0 && !loadingPosts ? (
            <div className="p-12 text-center opacity-20"><MessageCircle size={40} className="mx-auto mb-4 text-pink-500" /><p className="text-[10px] font-black uppercase tracking-widest">No posts found</p></div>
          ) : posts.map((post) => (
            <div key={post.id} onClick={() => { setSelectedPost(post); setView('chat'); }} className={cn("p-4 cursor-pointer border-b border-slate-100 dark:border-white/5 transition-all flex items-start gap-3 group relative", selectedPost?.id === post.id ? "bg-white dark:bg-[#16161d] shadow-sm" : "hover:bg-white/50 dark:hover:bg-white/5")}>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200 dark:border-white/10 shadow-sm">
                <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">{post.caption || 'No caption'}</p>
                <div className="flex items-center gap-3 mt-2">
                   <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase">
                      <Heart size={10} className="text-pink-500" /> {post.like_count || 0}
                   </div>
                   <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase">
                      <MessageCircle size={10} className="text-blue-500" /> {post.comments_count || 0}
                   </div>
                   {(post.auto_reply_enabled || post.auto_dm_enabled) && <Zap size={10} className="text-emerald-500 animate-pulse" />}
                </div>
              </div>
              {selectedPost?.id === post.id && <div className="absolute left-0 top-4 bottom-4 w-1 bg-pink-500 rounded-r-full shadow-[0_0_8px_rgba(236,72,153,0.5)]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Comments/Chat */}
      <div className={cn(
        "flex-1 flex flex-col bg-white dark:bg-[#050505] relative overflow-hidden transition-all",
        view === 'list' ? 'hidden sm:flex' : 'flex'
      )}>
        
        {/* Keyword Guard Overlay */}
        <AnimatePresence>
          {showGuard && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0 z-50 bg-slate-50 dark:bg-[#0f0f13] flex flex-col">
               <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#111118]">
                  <div className="flex items-center gap-2"><ShieldCheck className="text-pink-500" size={18} /><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Keyword Guard</h3></div>
                  <button onClick={() => setShowGuard(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400"><X size={20} /></button>
               </div>
               <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-8">
                  <div className="flex items-center justify-between p-5 bg-pink-500/5 border border-pink-500/10 rounded-xl">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${autoDelete ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                           <ShieldAlert size={20} />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Auto-Delete Mode</h4>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Remove flagged IG comments instantly</p>
                        </div>
                     </div>
                     <button onClick={toggleAutoDelete} className={`w-12 h-6 rounded-full p-1 transition-all ${autoDelete ? 'bg-pink-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoDelete ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Banned Keywords</label>
                     <div className="flex gap-2">
                        <input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()} placeholder="Add word..." className="flex-1 h-12 bg-white dark:bg-[#1a1a25] border border-slate-100 dark:border-white/5 rounded-xl px-4 text-sm outline-none text-slate-900 dark:text-white focus:ring-1 focus:ring-pink-500" />
                        <button onClick={handleAddKeyword} className="w-12 h-12 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"><Plus size={20} /></button>
                     </div>
                     <div className="flex flex-wrap gap-2 pt-2">
                        {keywords.map((word) => (
                          <div key={word} className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5 group">
                             <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{word}</span>
                             <button onClick={() => handleRemoveKeyword(word)} className="text-slate-400 hover:text-pink-500"><X size={14} /></button>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Automation Overlay */}
        <AnimatePresence>
          {showAutoManager && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 z-50 bg-slate-50 dark:bg-[#0f0f13] flex flex-col">
               <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#111118]">
                  <div className="flex items-center gap-2"><Bot className="text-emerald-500" size={18} /><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">IG Automation</h3></div>
                  <button onClick={() => setShowAutoManager(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400"><X size={20} /></button>
               </div>
               <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6 pb-0">
                  <div className="p-5 bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/5 rounded-xl space-y-4">
                     <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Trigger Keywords</span>
                     <input value={triggerKeyword} onChange={(e) => setTriggerKeyword(e.target.value)} placeholder="Price, Link (Empty for all)..." className="w-full h-12 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-xl px-4 text-xs outline-none text-slate-900 dark:text-white focus:ring-1 focus:ring-pink-500" />
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Public Reply</span><button onClick={() => setIsAutoReplyEnabled(!isAutoReplyEnabled)} className={cn("w-12 h-6 rounded-full relative transition-all", isAutoReplyEnabled ? "bg-pink-500" : "bg-slate-200 dark:bg-white/10")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAutoReplyEnabled ? "left-7" : "left-1")} /></button></div>
                     <textarea value={autoReplyText} onChange={(e) => setAutoReplyText(e.target.value)} placeholder="Write public reply..." className="w-full h-28 bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-xs outline-none text-slate-900 dark:text-white resize-none focus:ring-1 focus:ring-pink-500" />
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest Private DM">Private DM</span><button onClick={() => setIsAutoDmEnabled(!isAutoDmEnabled)} className={cn("w-12 h-6 rounded-full relative transition-all", isAutoDmEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAutoDmEnabled ? "left-7" : "left-1")} /></button></div>
                     <textarea value={autoDmText} onChange={(e) => setAutoDmText(e.target.value)} placeholder="Write private DM content..." className="w-full h-28 bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-xs outline-none text-slate-900 dark:text-white resize-none focus:ring-1 focus:ring-emerald-500" />
                  </div>

                  <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl space-y-3">
                     <div className="flex items-center gap-2 mb-1">
                        <Bot size={14} className="text-pink-500" />
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Continuity flow</span>
                     </div>
                     <p className="text-[9px] text-pink-600/70 font-medium leading-tight mb-2">Select a ChatFlow to trigger automatically when the customer replies to your DM on Instagram.</p>
                     <select 
                       value={selectedFlowId} 
                       onChange={(e) => setSelectedFlowId(e.target.value)}
                       className="w-full h-12 bg-white dark:bg-[#1a1a25] border border-pink-200 dark:border-white/10 rounded-xl px-4 text-xs outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                     >
                        <option value="">No flow (End after DM)</option>
                        {flows.map(f => (
                           <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                     </select>
                  </div>

                  <button onClick={handleSaveAutomation} className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all">Save IG automation</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedPost ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 bg-white dark:bg-[#16161d] border-b border-slate-100 dark:border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
               <div className="flex items-center gap-3">
                  <button onClick={() => setView('list')} className="p-2 -ml-2 text-slate-400 sm:hidden"><ChevronLeft size={20} /></button>
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm shrink-0">
                    <img src={selectedPost.thumbnail_url || selectedPost.media_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none truncate max-w-[150px]">IG Post: {selectedPost.id.slice(-6)}</h4>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Comments: {comments.length}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => setShowAutoManager(true)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm", (selectedPost.auto_reply_enabled || selectedPost.auto_dm_enabled) ? "bg-pink-500 text-white" : "bg-white dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/5")}><Bot size={14} /><span className="hidden xs:inline">Automate</span></button>
                  <a href={selectedPost.permalink} target="_blank" className="p-2 text-slate-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:text-pink-500 transition-all"><ExternalLink size={16} /></a>
               </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50 dark:bg-[#050505]">
               {loadingComments ? (
                 <div className="flex flex-col items-center justify-center py-20"><RefreshCw className="animate-spin text-pink-500" size={24} /></div>
               ) : comments.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center"><MessageSquare size={48} className="mb-4" /><p className="text-xs font-black uppercase tracking-widest">No comments found</p></div>
               ) : (
                 <div className="space-y-4 pb-0">
                    {comments.map((comment) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={comment.id} className="bg-white dark:bg-[#16161d] p-5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm relative group">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                               {comment.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[12px] font-black text-slate-900 dark:text-white truncate">@{comment.username}</span>
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                  </div>
                               </div>
                               <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium break-words mb-3">"{comment.text}"</p>
                               <div className="flex items-center gap-4">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={11} /> {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Heart size={11} className="text-pink-500" /> {comment.like_count || 0}</span>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 select-none p-10 text-center">
             <MessageCircle size={80} className="mb-6" />
             <p className="text-sm font-black uppercase tracking-[0.3em] leading-loose">Select a post to manage Instagram engagement</p>
          </div>
        )}
      </div>
    </div>
  );
};
