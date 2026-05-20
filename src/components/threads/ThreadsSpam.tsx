import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, CheckCircle, RefreshCw, MessageSquare, AlertTriangle, User, Calendar, Search } from 'lucide-react';
import { API_URL, getHeaders, db, collection, query, where, onSnapshot, deleteDoc, doc } from '../../api';

export const ThreadsSpam = ({ user, account }: { user: any; account: any }) => {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [spamComments, setSpamComments] = useState<any[]>([]);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [searchThreads, setSearchThreads] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchThreads = async () => {
    if (!account?.id) return;
    try {
      const res = await fetch(`${API_URL}/threads/feed?accountId=${account.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) setThreads(data.threads || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchThreads();
    if (!account?.id) return;

    const q = query(collection(db, 'threads_spam'), where('accountId', '==', account.id));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSpamComments(items.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });
    return () => unsub();
  }, [account]);

  const toggleSelectComment = (id: string) => {
    setSelectedComments(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) return;
    if (!confirm(`Delete ${selectedComments.length} selected spam comments?`)) return;
    
    setIsBulkDeleting(true);
    try {
      for (const id of selectedComments) {
        const item = spamComments.find(s => s.id === id);
        if (item) {
          await fetch(`${API_URL}/threads/replies/${item.replyId}?accountId=${account.id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
          await deleteDoc(doc(db, 'threads_spam', id));
        }
      }
      setSelectedComments([]);
      (window as any).showToast(`${selectedComments.length} comments deleted`, "success");
    } catch (e) {
      (window as any).showToast("Bulk delete failed", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setSelectedThread(threadId);
    setSearchThreads(threadId);
    setShowDropdown(false);
  };

  const handleDelete = async (id: string, threadId: string, replyId: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch(`${API_URL}/threads/replies/${replyId}?accountId=${account.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        await deleteDoc(doc(db, 'threads_spam', id));
        (window as any).showToast("Spam comment deleted", "success");
      }
    } catch (e) {
      console.error(e);
      (window as any).showToast("Failed to delete", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleIgnore = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'threads_spam', id));
      (window as any).showToast("Comment marked as safe", "success");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="animate-spin text-slate-300" size={32} />
      </div>
    );
  }

  const filteredSpam = spamComments.filter(s => !selectedThread || s.threadId === selectedThread);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0f0f13] overflow-hidden">
      {/* Integrated Header with Search & Selector */}
      <div className="py-2.5 px-3 md:px-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#16161d] flex items-center justify-between gap-2 md:gap-4">
         {/* Title: Hidden on mobile to save space */}
         <div className="hidden md:flex items-center gap-3 flex-none">
            <div className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center shadow-sm">
               <ShieldAlert size={18} />
            </div>
            <div>
               <h2 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Spam Audit</h2>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {filteredSpam.length} Flagged
               </p>
            </div>
         </div>

         {/* Middle Section: Smart Search & Dropdown - Expanded on Mobile */}
         <div className="flex-1 flex items-center gap-2 md:gap-3 max-w-full md:max-w-lg relative">
            <button 
              onClick={() => {
                setSelectedThread(null);
                setSearchThreads('');
                setShowDropdown(false);
              }}
              className={`flex-none px-3 md:px-4 py-2 md:py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!selectedThread && !searchThreads ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
            >
               All
            </button>

            <div className="relative flex-1 group">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
               <input 
                 value={searchThreads}
                 onFocus={() => setShowDropdown(true)}
                 onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                 onChange={(e) => setSearchThreads(e.target.value)}
                 placeholder="Search / Select Post..." 
                 className="w-full h-9 md:h-8 pl-8 pr-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] md:text-[9px] font-bold outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-all"
               />
               
               {/* Smart Dropdown Menu: Full width on mobile */}
               {showDropdown && (
                 <div className="absolute top-full left-[-45px] md:left-0 right-0 w-[calc(100vw-24px)] md:w-full mt-1 bg-white dark:bg-[#1c1c26] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto no-scrollbar py-2">
                    {threads.filter(t => !searchThreads || t.id.includes(searchThreads)).length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold p-3 text-center uppercase">No posts found</p>
                    ) : (
                      threads
                        .filter(t => !searchThreads || t.id.includes(searchThreads))
                        .map((t) => (
                        <div 
                          key={t.id}
                          onClick={() => handleSelectThread(t.id)}
                          className="px-4 py-3 md:py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-slate-50 dark:border-white/5 last:border-0 group"
                        >
                           <p className="text-[11px] md:text-[10px] font-black text-slate-900 dark:text-white uppercase group-hover:text-blue-500 transition-colors">Post ID: {t.id}</p>
                           <p className="text-[9px] md:text-[8px] text-slate-400 font-bold uppercase mt-0.5 opacity-60">Click to scan this thread</p>
                        </div>
                      ))
                    )}
                 </div>
               )}
            </div>
         </div>
         
         <div className="flex items-center gap-2 flex-none">
            {selectedComments.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3 md:px-4 py-2 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg flex items-center gap-2"
              >
                {isBulkDeleting ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span className="hidden sm:inline">Delete</span> ({selectedComments.length})
              </button>
            )}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {spamComments.filter(s => !selectedThread || s.threadId === selectedThread).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
             <CheckCircle size={48} className="text-emerald-500 mb-4" />
             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Your profile is clean!</p>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">No spam detected by Keyword Guard</p>
          </div>
        ) : (
          spamComments
            .filter(s => !selectedThread || s.threadId === selectedThread)
            .map((item) => (
            <div key={item.id} className={`bg-white dark:bg-[#16161d] p-5 rounded-2xl border transition-all shadow-sm group ${selectedComments.includes(item.id) ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-white/5 hover:border-rose-500/30'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                 <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button 
                      onClick={() => toggleSelectComment(item.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedComments.includes(item.id) ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-200 dark:border-white/20'}`}
                    >
                      {selectedComments.includes(item.id) && <CheckCircle size={12} />}
                    </button>

                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-500 text-xs font-black">
                          {item.username?.[0]?.toUpperCase()}
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">@{item.username}</h4>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                             <Calendar size={10} />
                             {new Date(item.timestamp).toLocaleString()}
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                       <AlertTriangle size={10} />
                       Flagged: {item.matched_keyword}
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 mb-4">
                 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                   "{item.text}"
                 </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                   <MessageSquare size={12} />
                   Found in thread: {item.threadId?.slice(-8)}
                 </p>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleIgnore(item.id)}
                      className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                       Ignore
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, item.threadId, item.replyId)}
                      disabled={isDeleting === item.id}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg flex items-center gap-2"
                    >
                       {isDeleting === item.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                       Delete Spam
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
