import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  MessageSquare, 
  Send, 
  User, 
  Calendar, 
  ExternalLink, 
  AtSign, 
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
  Mail,
  ZapOff,
  Image as ImageIcon,
  FileText,
  Key,
  Paperclip,
  UploadCloud,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { API_URL, getHeaders, db, updateDoc, setDoc, uploadFile, getFileUrl, query, where, onSnapshot } from '../../api';
import { motion, AnimatePresence } from 'motion/react';

export const ThreadsComments = ({ user, account }: { user: any, account: any }) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // Mobile UI State
  const [view, setView] = useState<'list' | 'chat'>('list');

  // Guard & Automation State
  const [showGuard, setShowGuard] = useState(false);
  const [showAutoManager, setShowAutoManager] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(account?.keyword_filters || []);
  const [autoDelete, setAutoDelete] = useState(account?.auto_delete_enabled || false);
  const [newKeyword, setNewKeyword] = useState('');

  const toggleAutoDelete = async () => {
    const newVal = !autoDelete;
    setAutoDelete(newVal);
    if (!account?.id) return;
    try {
      await updateDoc(`threads_accounts/${account.id}`, { auto_delete_enabled: newVal });
      (window as any).showToast(newVal ? "Auto-delete mode active" : "Auto-delete mode paused", "success");
    } catch (e) {
      console.error(e);
      (window as any).showToast("Failed to update setting", "error");
    }
  };

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

  const fetchThreads = async () => {
    if (!account?.id) return;
    setLoadingThreads(true);
    try {
      const res = await fetch(`${API_URL}/threads/feed?accountId=${account.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setThreads(data.threads || []);
        if (data.threads?.length > 0 && !selectedThread) setSelectedThread(data.threads[0]);
      }
    } catch (e) { console.error(e); } finally { setLoadingThreads(false); }
  };

  const fetchReplies = async (threadId: string) => {
    if (!account?.id || !threadId) return;
    setLoadingReplies(true);
    try {
      const res = await fetch(`${API_URL}/threads/replies?accountId=${account.id}&threadId=${threadId}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        const fetchedReplies = data.replies || [];
        setReplies(fetchedReplies);

        // Spam Scanner Logic
        if (keywords.length > 0) {
           for (const reply of fetchedReplies) {
              const matchedWord = keywords.find(word => reply.text.toLowerCase().includes(word.toLowerCase()));
              if (matchedWord) {
                 // 1. Log to Spam collection for audit
                 const spamId = `spam_${reply.id}`;
                 await setDoc('threads_spam', spamId, {
                    accountId: account.id,
                    threadId: threadId,
                    replyId: reply.id,
                    text: reply.text,
                    username: reply.username,
                    timestamp: reply.timestamp,
                    matched_keyword: matchedWord,
                    status: autoDelete ? 'deleted' : 'flagged'
                 });

                 // 2. Auto-Delete if enabled
                 if (autoDelete) {
                    await fetch(`${API_URL}/threads/replies/${reply.id}?accountId=${account.id}`, {
                       method: 'DELETE',
                       headers: getHeaders()
                    });
                    // Refresh replies after delete to keep UI clean
                    setReplies(prev => prev.filter(r => r.id !== reply.id));
                 }
              }
           }
        }
      }
    } catch (e) { console.error(e); } finally { setLoadingReplies(false); }
  };

  useEffect(() => { fetchThreads(); }, [account]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query('chat_flows_threads', where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snap: any) => {
       setFlows(snap.docs.map((d: any) => d.data()));
    });
    return () => unsub();
  }, [user?.uid]);
  useEffect(() => {
    if (selectedThread) {
      fetchReplies(selectedThread.id);
      setAutoReplyText(selectedThread.auto_reply_text || '');
      setIsAutoReplyEnabled(selectedThread.auto_reply_enabled || false);
      setAutoDmText(selectedThread.auto_dm_text || '');
      setIsAutoDmEnabled(selectedThread.auto_dm_enabled || false);
      setTriggerKeyword(selectedThread.trigger_keyword || '');
      setDmAttachmentUrl(selectedThread.dm_attachment_url || '');
      setSelectedFlowId(selectedThread.continuity_flow_id || '');
    }
  }, [selectedThread]);

  const handlePostReply = async (targetId: string) => {
    if (!replyText.trim() || !account?.id) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${API_URL}/threads/replies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ accountId: account.id, threadId: targetId, text: replyText })
      });
      if (res.ok) {
        setReplyText('');
        fetchReplies(selectedThread.id);
        (window as any).showToast("Reply posted", "success");
      }
    } catch (e) { console.error(e); } finally { setSendingReply(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      setDmAttachmentUrl(getFileUrl(result.url));
      (window as any).showToast("Resource uploaded", "success");
    } catch (err) { (window as any).showToast("Upload failed", "error"); } finally { setIsUploading(false); }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    const updated = [...keywords, newKeyword.trim().toLowerCase()];
    setKeywords(updated);
    setNewKeyword('');
    await updateDoc(`threads_accounts/${account.id}`, { keyword_filters: updated });
    (window as any).showToast("Filter added", "success");
  };

  const handleRemoveKeyword = async (word: string) => {
    const updated = keywords.filter(k => k !== word);
    setKeywords(updated);
    await updateDoc(`threads_accounts/${account.id}`, { keyword_filters: updated });
  };

  const handleSaveAutomation = async () => {
    if (!selectedThread) return;
    try {
      await updateDoc(`threads_posts/${selectedThread.id}`, {
        threadId: selectedThread.id,
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
      setThreads(threads.map(t => t.id === selectedThread.id ? { 
        ...t, 
        auto_reply_enabled: isAutoReplyEnabled, 
        auto_reply_text: autoReplyText, 
        auto_dm_enabled: isAutoDmEnabled, 
        auto_dm_text: autoDmText, 
        trigger_keyword: triggerKeyword.trim().toLowerCase(), 
        dm_attachment_url: dmAttachmentUrl.trim(),
        continuity_flow_id: selectedFlowId
      } : t));
      (window as any).showToast("Settings saved", "success");
      setShowAutoManager(false);
    } catch (e) { (window as any).showToast("Save failed", "error"); }
  };

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="h-full flex bg-white dark:bg-[#0a0a0f] overflow-hidden relative">
      {/* Sidebar - Hidden on mobile if viewing chat */}
      <div className={cn(
        "w-full sm:w-72 border-r border-slate-100 dark:border-white/10 flex flex-col bg-white dark:bg-[#111118] transition-all",
        view === 'chat' ? 'hidden sm:flex' : 'flex'
      )}>
        <div className="p-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-[9px] font-black capitalize tracking-widest text-slate-400">Moderation Feed</h3>
          <div className="flex items-center gap-1">
             <button 
               onClick={() => setShowAutoManager(!showAutoManager)} 
               title="Smart Automation (DM + Flow)"
               className={cn("p-1.5 rounded-lg transition-all", showAutoManager ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-emerald-500")}
             >
               <Bot size={14} />
             </button>
             <button onClick={() => setShowGuard(!showGuard)} title="Keyword Guard" className={cn("p-1.5 rounded-lg transition-all", showGuard ? "bg-blue-500 text-white" : "text-slate-400 hover:text-blue-500")}><Shield size={14} /></button>
             <button onClick={fetchThreads} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white transition-all"><RefreshCw size={14} className={loadingThreads ? 'animate-spin' : ''} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {threads.map((thread) => (
            <div key={thread.id} onClick={() => { setSelectedThread(thread); setView('chat'); }} className={cn("p-3.5 cursor-pointer border-b border-slate-50 dark:border-white/10 transition-all flex items-center justify-between group", selectedThread?.id === thread.id ? "bg-slate-50 dark:bg-white/10 border-l-2 border-l-black dark:border-l-white" : "hover:bg-slate-100/50 dark:hover:bg-white/[0.08]")}>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">{thread.text || 'Media post...'}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-[8px] font-black uppercase text-slate-400">{new Date(thread.timestamp).toLocaleDateString()}</span>
                   {(thread.auto_reply_enabled || thread.auto_dm_enabled) && <Zap size={10} className="text-emerald-500 animate-pulse" />}
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 sm:hidden" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Always visible on desktop, only on mobile when chat selected */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50 dark:bg-[#0d0d12] relative overflow-hidden transition-all",
        view === 'list' ? 'hidden sm:flex' : 'flex'
      )}>
        
        {/* Overlays (Guard & Automation) - Full screen on mobile */}
        <AnimatePresence>
          {showGuard && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0 z-50 bg-white dark:bg-[#0a0a0f] flex flex-col sm:border-l sm:border-white/10">
               <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#111118]">
                  <div className="flex items-center gap-2"><ShieldCheck className="text-blue-500" size={18} /><h3 className="text-xs font-black capitalize tracking-widest text-slate-900 dark:text-white">Keyword Guard</h3></div>
                  <button onClick={() => setShowGuard(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400"><X size={20} /></button>
               </div>
               <div className="px-2 py-4 flex-1 overflow-y-auto no-scrollbar space-y-6">
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 flex items-start gap-3"><Zap className="text-blue-500 shrink-0" size={18} /><p className="text-[11px] text-blue-600 font-bold capitalize">Auto-delete spam comments instantly.</p></div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Banned Words</label>
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${autoDelete ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                           <ShieldAlert size={20} />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Auto-Delete Mode</h4>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automatically remove spam comments</p>
                        </div>
                     </div>
                     <button 
                       onClick={toggleAutoDelete}
                       className={`w-12 h-6 rounded-full p-1 transition-all ${autoDelete ? 'bg-rose-500' : 'bg-slate-300 dark:bg-white/10'}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoDelete ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>

                  <div className="flex gap-2 mb-6">
                        <input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()} placeholder="Add word..." className="flex-1 h-12 bg-slate-50 dark:bg-[#1a1a25] border border-slate-100 dark:border-white/10 rounded-lg px-4 text-sm outline-none text-slate-900 dark:text-white" />
                        <button onClick={handleAddKeyword} className="w-12 h-12 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-lg"><Plus size={20} /></button>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pb-10">
                     {keywords.map((word) => (
                       <div key={word} className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10"><span className="text-xs font-black text-slate-700 dark:text-slate-200 capitalize">{word}</span><button onClick={() => handleRemoveKeyword(word)} className="text-slate-400"><X size={14} /></button></div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAutoManager && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 z-50 bg-white dark:bg-[#0a0a0f] flex flex-col sm:border-t sm:border-white/10">
               <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#111118]">
                  <div className="flex items-center gap-2"><Bot className="text-emerald-500" size={18} /><h3 className="text-xs font-black capitalize tracking-widest text-slate-900 dark:text-white">Smart automation</h3></div>
                  <button onClick={() => setShowAutoManager(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400"><X size={20} /></button>
               </div>
               <div className="px-2 py-4 overflow-y-auto no-scrollbar space-y-6 pb-40">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf" />
                  <div className="p-4 bg-slate-50 dark:bg-[#1a1a25] border border-slate-100 dark:border-white/10 rounded-lg space-y-3">
                     <span className="text-[11px] font-black text-blue-500">Trigger keyword</span>
                     <input value={triggerKeyword} onChange={(e) => setTriggerKeyword(e.target.value)} placeholder="e.g. Link (Empty for all)..." className="w-full h-12 bg-white dark:bg-[#252535] border border-slate-200 dark:border-white/10 rounded-lg px-4 text-sm outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between"><span className="text-[11px] font-black text-slate-900 dark:text-white">Public reply</span><button onClick={() => setIsAutoReplyEnabled(!isAutoReplyEnabled)} className={cn("w-12 h-6 rounded-full relative transition-all", isAutoReplyEnabled ? "bg-blue-500" : "bg-slate-200 dark:bg-white/10")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAutoReplyEnabled ? "left-7" : "left-1")} /></button></div>
                     <textarea value={autoReplyText} onChange={(e) => setAutoReplyText(e.target.value)} placeholder="Public reply..." className="w-full h-24 bg-slate-50 dark:bg-[#1a1a25] border border-slate-100 dark:border-white/10 rounded-lg p-4 text-sm outline-none text-slate-900 dark:text-white resize-none" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between"><span className="text-[11px] font-black text-slate-900 dark:text-white">Private DM</span><button onClick={() => setIsAutoDmEnabled(!isAutoDmEnabled)} className={cn("w-12 h-6 rounded-full relative transition-all", isAutoDmEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAutoDmEnabled ? "left-7" : "left-1")} /></button></div>
                     <textarea value={autoDmText} onChange={(e) => setAutoDmText(e.target.value)} placeholder="Private DM..." className="w-full h-24 bg-slate-50 dark:bg-[#1a1a25] border border-slate-100 dark:border-white/10 rounded-lg p-4 text-sm outline-none text-slate-900 dark:text-white resize-none" />
                     <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-4">
                        <div className="flex items-center justify-between"><span className="text-[10px] font-black text-emerald-600">Attached resource</span><button onClick={() => fileInputRef.current?.click()} className="h-10 px-4 bg-white dark:bg-[#111118] dark:text-white rounded-lg border border-emerald-200 dark:border-white/10 text-[10px] font-black uppercase">{isUploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}</button></div>
                        <input value={dmAttachmentUrl} onChange={(e) => setDmAttachmentUrl(e.target.value)} placeholder="Paste link or upload..." className="w-full h-10 bg-white dark:bg-[#252535] border border-emerald-200 dark:border-white/10 rounded-lg px-3 text-[11px] outline-none text-slate-900 dark:text-white" />
                     </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg space-y-3">
                     <div className="flex items-center gap-2 mb-1">
                        <Bot size={14} className="text-blue-500" />
                        <span className="text-[11px] font-black text-blue-500">Continuity flow</span>
                     </div>
                     <p className="text-[10px] text-blue-600/70 font-medium leading-tight mb-2">Select a ChatFlow to trigger automatically when the customer replies to your DM.</p>
                     <select 
                       value={selectedFlowId} 
                       onChange={(e) => setSelectedFlowId(e.target.value)}
                       className="w-full h-12 bg-white dark:bg-[#1a1a25] border border-blue-200 dark:border-white/10 rounded-lg px-4 text-sm outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                     >
                        <option value="">No flow (End after DM)</option>
                        {flows.map(f => (
                           <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                     </select>
                  </div>

                  <button onClick={handleSaveAutomation} className="w-full h-12 bg-black dark:bg-white text-white dark:text-black rounded-lg font-black text-sm shadow-2xl">Save automation</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedThread ? (
          <>
            <div className="p-3 bg-white dark:bg-[#16161d] border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <button onClick={() => setView('list')} className="p-2 -ml-2 text-slate-400 sm:hidden"><ChevronLeft size={20} /></button>
                  <div className="w-8 h-8 bg-black dark:bg-[#252535] rounded-xl flex items-center justify-center text-white dark:text-slate-200 text-[10px] font-black border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                     {account?.profilePicture ? (
                       <img src={account.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                     ) : (
                       selectedThread.username?.[0]?.toUpperCase()
                     )}
                  </div>
                  <div className="min-w-0"><h4 className="text-[11px] font-black text-slate-900 dark:text-white leading-none truncate max-w-[120px]">@{selectedThread.username}</h4></div>
               </div>
               <div className="flex items-center gap-1.5">
                  <button onClick={() => setShowAutoManager(true)} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all", (selectedThread.auto_reply_enabled || selectedThread.auto_dm_enabled) ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500")}><Bot size={14} /><span className="hidden xs:inline">Automate</span></button>
                  <a href={selectedThread.permalink} target="_blank" className="p-2 text-slate-400 border border-slate-100 dark:border-white/10 rounded-xl"><ExternalLink size={16} /></a>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-slate-50 dark:bg-[#0d0d12]">
               {loadingReplies ? (<div className="flex flex-col items-center justify-center py-20"><RefreshCw className="animate-spin text-slate-300" size={24} /></div>) : (
                 <div className="space-y-3">
                    <h4 className="text-[9px] font-black capitalize text-slate-400 tracking-[0.2em] mb-4 px-1">Replies ({replies.length})</h4>
                    {replies.map((reply) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={reply.id} className="bg-white dark:bg-[#16161d] p-4 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg border border-slate-100 dark:border-white/10 flex items-center justify-center text-[9px] font-black text-slate-400 overflow-hidden shrink-0">
                               {account?.profilePicture ? <img src={account.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : (reply.username?.[0]?.toUpperCase() || '?')}
                            </div>
                            <div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-2 mb-1"><span className="text-[11px] font-black text-slate-900 dark:text-white truncate">@{reply.username}</span><span className="text-[8px] font-bold text-slate-400 uppercase shrink-0">{new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium break-words">{reply.text}</p></div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}
            </div>
            <div className="p-3 bg-white dark:bg-[#16161d] border-t border-slate-100 dark:border-white/10">
               <div className="flex gap-2"><input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Reply to @${selectedThread.username}...`} className="flex-1 h-12 bg-slate-50 dark:bg-[#252535] border border-slate-100 dark:border-white/10 rounded-2xl px-4 text-sm outline-none text-slate-900 dark:text-white" /><button onClick={() => handlePostReply(selectedThread.id)} disabled={!replyText.trim() || sendingReply} className="w-12 h-12 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-lg">{sendingReply ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}</button></div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 px-10 text-center"><MessageSquare size={64} className="mb-4 text-slate-400" /><p className="text-sm font-black capitalize text-slate-400">Select a thread to manage comments</p></div>
        )}
      </div>
    </div>
  );
};
