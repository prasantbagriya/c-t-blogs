import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Heart, MessageCircle, Repeat, Share2, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { Threads } from '../common/BrandIcons';
import { API_URL, getHeaders } from '../../api/common';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export const ThreadsFeed = ({ user, account, isMini = false }: { user: any, account: any, isMini?: boolean }) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Comment State
  const [activeComments, setActiveComments] = useState<Record<string, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [account]);

  const fetchFeed = async (cursor?: string) => {
    if (!account?.id) return;
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      let url = `${API_URL}/threads/feed?accountId=${account.id}`;
      if (cursor) url += `&after=${cursor}`;

      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        if (cursor) {
           setThreads(prev => [...prev, ...(data.threads || [])]);
        } else {
           setThreads(data.threads || []);
        }
        setNextCursor(data.paging?.cursors?.after || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor) fetchFeed(nextCursor);
  };

  const toggleComments = async (threadId: string) => {
    if (activeComments[threadId]) {
      setActiveComments(prev => ({ ...prev, [threadId]: false }));
      return;
    }

    setActiveComments(prev => ({ ...prev, [threadId]: true }));
    if (commentsData[threadId]) return; // Already loaded

    setLoadingComments(prev => ({ ...prev, [threadId]: true }));
    try {
      const res = await fetch(`${API_URL}/threads/replies?accountId=${account.id}&threadId=${threadId}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setCommentsData(prev => ({ ...prev, [threadId]: data.replies || [] }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(prev => ({ ...prev, [threadId]: false }));
    }
  };

  const handlePostReply = async (targetId: string, text: string) => {
    if (!text.trim() || !account?.id) return;
    try {
      const res = await fetch(`${API_URL}/threads/replies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ accountId: account.id, threadId: targetId, text })
      });
      if (res.ok) {
        (window as any).showToast("Reply posted", "success");
        // We don't know the threadId easily here without passing it, but let's refresh all loaded comments for now or just trust Meta
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (threadId: string) => {
    if (!account?.id) return;
    if (!confirm("Are you sure? This will delete the post from Threads (Meta) permanently.")) return;

    setDeletingId(threadId);
    try {
      const res = await fetch(`${API_URL}/threads/delete?accountId=${account.id}&threadId=${threadId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (res.ok) {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        (window as any).showToast("Thread deleted successfully from Meta", "success");
      } else {
        const error = await res.json();
        (window as any).showToast(error.message || "Failed to delete thread", "error");
      }
    } catch (e) {
      console.error(e);
      (window as any).showToast("Network error during deletion", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="pt-2 px-2 pb-20 bg-slate-50 dark:bg-[#0f0f13]">
      <div className="mx-auto space-y-3">
        <div className="flex items-center justify-between mb-2 px-1">
           <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-black dark:bg-white rounded-full" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Threads</h2>
           </div>
           <button 
             onClick={fetchFeed}
             disabled={loading}
             className="p-2 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 hover:text-black dark:hover:text-white transition-all shadow-sm"
           >
             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>

        {loading && threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
             <RefreshCw className="animate-spin text-slate-300 mb-4" size={32} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Feed...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 mx-1">
             <Threads className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Recent Activity</p>
          </div>
        ) : (
          <div className={cn("space-y-2 pb-10", isMini && "pb-2")}>
            {threads.slice(0, isMini ? 3 : 100).map((thread) => (
              <div key={thread.id} className={cn(
                "bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-4 hover:border-blue-500/50 transition-all group shadow-sm",
                isMini && "p-3 border-none shadow-none bg-slate-50/50 dark:bg-white/5"
              )}>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-500 text-xs font-black overflow-hidden">
                       {account?.profilePicture ? (
                         <img src={account.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                       ) : (
                         thread.username?.[0]?.toUpperCase()
                       )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                         <span className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">@{thread.username}</span>
                         <span className="text-[9px] text-slate-400 font-bold shrink-0 uppercase tracking-widest">Live</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDelete(thread.id);
                          }}
                          disabled={deletingId === thread.id}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            deletingId === thread.id ? "bg-rose-500 text-white" : "text-slate-300 hover:text-rose-500 hover:bg-rose-500/10"
                          )}
                          title="Delete from Meta Threads"
                        >
                          {deletingId === thread.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                        <a href={thread.permalink} target="_blank" rel="noreferrer" className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                           <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                    
                    {!isMini && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-3">
                        {thread.text}
                      </p>
                    )}
                    
                    {isMini && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {thread.text}
                      </p>
                    )}

                    {thread.children?.data?.length > 0 ? (
                      <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {thread.children.data.map((child: any) => (
                          <div key={child.id} className="shrink-0 w-[240px] rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                            {child.media_type === 'VIDEO' ? (
                              <video src={child.media_url} className="w-full h-[180px] object-cover bg-black" />
                            ) : (
                              <img src={child.media_url} className="w-full h-[180px] object-cover" alt="Carousel content" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : thread.media_url ? (
                      <div className="mb-3 rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                         {thread.media_type === 'VIDEO' ? (
                           <video src={thread.media_url} controls className="w-full max-h-[300px] object-contain bg-black" />
                         ) : (
                           <img src={thread.media_url} alt="Thread content" className="w-full max-h-[400px] object-contain" />
                         )}
                      </div>
                    ) : null}

                    <div className="flex items-center gap-6 pt-3 border-t border-slate-50 dark:border-white/5 text-slate-400">
                       <a href={thread.permalink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-rose-500 transition-all group/btn">
                          <Heart size={14} className="text-rose-500 fill-rose-500/10 group-hover/btn:fill-rose-500 transition-all" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{thread.like_count || 0}</span>
                       </a>
                       <button 
                         onClick={() => toggleComments(thread.id)}
                         className={cn("flex items-center gap-1.5 transition-all group/btn", activeComments[thread.id] ? "text-blue-500" : "hover:text-blue-500")}
                       >
                          <MessageCircle size={14} className={activeComments[thread.id] ? "text-blue-500" : ""} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{thread.reply_count || 0}</span>
                       </button>
                       <a href={thread.permalink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-500 transition-all group/btn">
                          <Repeat size={14} className="text-emerald-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{thread.repost_count || 0}</span>
                       </a>
                       <div className="flex items-center gap-1.5 hover:text-blue-500 transition-all group/btn">
                          <Share2 size={14} className="text-blue-400" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{thread.quote_count || 0}</span>
                       </div>
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(thread.permalink);
                           (window as any).showToast("Link copied to clipboard", "success");
                         }}
                         className="ml-auto p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-black dark:hover:text-white"
                         title="Copy Post Link"
                       >
                          <Share2 size={14} />
                       </button>
                    </div>

                    {/* Inline Comment Section */}
                    {activeComments[thread.id] && (
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Comments</span>
                           {loadingComments[thread.id] && <Loader2 size={12} className="animate-spin text-blue-500" />}
                        </div>
                        {commentsData[thread.id]?.length > 0 ? (
                          <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pb-4">
                            {commentsData[thread.id].map((reply: any) => (
                              <div key={reply.id} className="space-y-2">
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[11px] font-black text-slate-900 dark:text-white">@{reply.username}</span>
                                     <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{new Date(reply.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{reply.text}</p>
                                </div>
                                
                                {/* Quick Reply Field */}
                                <div className="flex gap-2 pl-4">
                                   <input 
                                     placeholder={`Reply to @${reply.username}...`}
                                     className="flex-1 h-9 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg px-3 text-[11px] outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-all"
                                     onKeyDown={(e) => {
                                       if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                         handlePostReply(reply.id, (e.target as HTMLInputElement).value);
                                         (e.target as HTMLInputElement).value = '';
                                       }
                                     }}
                                   />
                                   <button 
                                     onClick={(e) => {
                                       const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                       if (input.value.trim()) {
                                         handlePostReply(reply.id, input.value);
                                         input.value = '';
                                       }
                                     }}
                                     className="h-9 px-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
                                   >
                                      Send
                                   </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : !loadingComments[thread.id] ? (
                          <p className="text-[10px] font-medium text-slate-400 text-center py-2">No comments found for this post.</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {nextCursor && (
              <div className="py-8 flex justify-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {loadingMore ? 'Loading More...' : 'Load More Threads'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
