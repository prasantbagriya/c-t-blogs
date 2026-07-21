import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
 Send, 
 MessageCircle, 
 BarChart3, 
 Globe, 
 RefreshCw, 
 ExternalLink, 
 Plus, 
 Image as ImageIcon, 
 Link as LinkIcon,
 Heart,
 Share2,
 MoreHorizontal,
 ChevronLeft,
 ChevronRight,
 ShieldCheck,
 AlertCircle,
 Users,
 Zap
} from 'lucide-react';
import { 
 getFacebookPageDetails, 
 getFacebookFeed, 
 getFacebookPostComments, 
 publishFacebookPost, 
 replyToFacebookComment,
 getFacebookPageAnalytics
} from '../../api/facebook';
import { Facebook } from '../common/BrandIcons';

interface FacebookPageManagerProps {
 pageId: string;
 onBack: () => void;
 showToast: (m: string, t: any) => void;
}

export function FacebookPageManager({ pageId, onBack, showToast }: FacebookPageManagerProps) {
 const [page, setPage] = useState<any>(null);
 const [feed, setFeed] = useState<any[]>([]);
 const [activeTab, setActiveTab] = useState<'posts' | 'feed' | 'analytics'>('feed');
 const [loading, setLoading] = useState(true);
 const [publishing, setPublishing] = useState(false);
 const [postMessage, setPostMessage] = useState('');
 const [postLink, setPostLink] = useState('');
 const [selectedPost, setSelectedPost] = useState<any>(null);
 const [comments, setComments] = useState<any[]>([]);
 const [loadingComments, setLoadingComments] = useState(false);
 const [replyText, setReplyText] = useState('');
 const [analytics, setAnalytics] = useState<any[]>([]);

 const loadData = async () => {
 setLoading(true);
 try {
 const [details, feedData, stats] = await Promise.all([
 getFacebookPageDetails(pageId),
 getFacebookFeed(pageId),
 getFacebookPageAnalytics(pageId)
 ]);
 setPage(details);
 setFeed(feedData);
 setAnalytics(stats);
 } catch (err: any) {
 showToast(err.message, 'error');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 }, [pageId]);

 const handlePublish = async () => {
 if (!postMessage.trim()) return;
 setPublishing(true);
 try {
 await publishFacebookPost(pageId, postMessage, postLink);
 showToast('Post published successfully!', 'success');
 setPostMessage('');
 setPostLink('');
 setActiveTab('feed');
 loadData();
 } catch (err: any) {
 showToast(err.message, 'error');
 } finally {
 setPublishing(false);
 }
 };

 const loadComments = async (postId: string) => {
 setLoadingComments(true);
 try {
 const data = await getFacebookPostComments(postId, pageId);
 setComments(data);
 } catch (err: any) {
 showToast(err.message, 'error');
 } finally {
 setLoadingComments(false);
 }
 };

 const handleReply = async (commentId: string) => {
 if (!replyText.trim()) return;
 try {
 await replyToFacebookComment(commentId, pageId, replyText);
 showToast('Reply posted!', 'success');
 setReplyText('');
 loadComments(selectedPost.id);
 } catch (err: any) {
 showToast(err.message, 'error');
 }
 };

 if (loading && !page) {
 return (
 <div className="flex flex-col items-center justify-center h-full gap-4">
 <RefreshCw size={32} className=" text-blue-600" />
 <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading Page Manager...</p>
 </div>
 );
 }

 return (
 <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0a0a0b]">
 {/* ── Premium Hero Header ── */}
 <header className="bg-white dark:bg-[#0f0f11] border-b border-slate-200/60 dark:border-white/5 px-6 py-8">
 <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
 <div className="flex items-center gap-6">
 <button 
 onClick={onBack}
 className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-none text-slate-500 hover:text-blue-600 "
 >
 <ChevronLeft size={24} />
 </button>
 
 <div className="relative">
 <div className="w-20 h-20 rounded-none bg-gradient-to-tr from-blue-600 to-indigo-400 p-1 ">
 {page?.picture?.data?.url ? (
 <img src={page.picture.data.url} className="w-full h-full rounded-none object-cover border-4 border-white dark:border-[#0f0f11]" />
 ) : (
 <div className="w-full h-full rounded-none bg-blue-600 flex items-center justify-center border-4 border-white dark:border-[#0f0f11]">
 <Facebook size={32} className="text-white" />
 </div>
 )}
 </div>
 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-none flex items-center justify-center text-white border-2 border-white dark:border-[#0f0f11] ">
 <Facebook size={14} />
 </div>
 </div>
 
 <div>
 <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">
 {page?.name}
 </h1>
 <div className="flex items-center gap-3 mt-1.5">
 <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-none uppercase tracking-widest border border-blue-500/10">
 {page?.category || 'Professional Page'}
 </span>
 <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase tracking-widest">
 <Users size={12} className="text-slate-300" />
 {page?.fan_count?.toLocaleString()} Followers
 </div>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button 
 onClick={loadData}
 className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 "
 >
 Refresh
 </button>
 <a 
 href={page?.link} 
 target="_blank" 
 className="px-6 py-3 bg-blue-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 -blue-500/20 flex items-center gap-2"
 >
 Visit <ExternalLink size={14} />
 </a>
 </div>
 </div>
 </header>

 {/* ── Minimalist Nav ── */}
 <nav className="bg-white/50 dark:bg-white/2 border-b border-slate-200/60 dark:border-white/5 px-6">
 <div className="max-w-6xl mx-auto flex gap-10">
 {[
 { id: 'feed', label: 'News Feed', icon: <Globe size={16} /> },
 { id: 'posts', label: 'New Post', icon: <Plus size={16} /> },
 { id: 'analytics', label: 'Insights', icon: <BarChart3 size={16} /> }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`py-6 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 border-b-2 relative ${ activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600' }`}
 >
 {tab.icon} {tab.label}
 {activeTab === tab.id && (
 <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
 )}
 </button>
 ))}
 </div>
 </nav>

 {/* ── Content ── */}
 <main className="flex-1 overflow-y-auto no-scrollbar p-6">
 <div className="max-w-6xl mx-auto">
 <AnimatePresence mode="wait">
 {activeTab === 'feed' && (
 <motion.div
 key="feed"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="grid grid-cols-1 md:grid-cols-2 gap-6"
 >
 {feed.length === 0 ? (
 <div className="col-span-full py-40 text-center bg-white dark:bg-white/2 rounded-none border border-slate-200/60 dark:border-white/5">
 <Globe size={64} className="mx-auto text-slate-100 dark:text-white/5 mb-6" />
 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">No content yet</h3>
 <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Share your first post to see it here</p>
 </div>
 ) : (
 feed.map((post) => (
 <div 
 key={post.id}
 className="bg-white dark:bg-[#111114] border border-slate-200/60 dark:border-white/5 rounded-none overflow-hidden hover: group flex flex-col"
 >
 {post.full_picture && (
 <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/2">
 <img src={post.full_picture} className="w-full h-full object-cover " />
 </div>
 )}
 <div className="p-8 flex-1 flex flex-col">
 <div className="flex justify-between items-center mb-6">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-none bg-blue-500/10 flex items-center justify-center">
 <Facebook size={14} className="text-blue-500" />
 </div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
 {new Date(post.created_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
 </p>
 </div>
 <button className="w-10 h-10 flex items-center justify-center rounded-none bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-600 ">
 <MoreHorizontal size={18} />
 </button>
 </div>
 
 <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-3 mb-8 leading-relaxed">
 {post.message || post.story || "No message content"}
 </p>
 
 <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
 <div className="flex gap-4">
 <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-500/5 rounded-none text-rose-600">
 <Heart size={14} className="fill-rose-600" />
 <span className="text-xs font-black">{post.likes?.summary?.total_count || 0}</span>
 </div>
 <button 
 onClick={() => { setSelectedPost(post); loadComments(post.id); }}
 className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/5 rounded-none text-blue-600 hover:bg-blue-600 hover:text-white "
 >
 <MessageCircle size={14} />
 <span className="text-xs font-black">{post.comments?.summary?.total_count || 0}</span>
 </button>
 </div>
 <a 
 href={post.permalink_url} 
 target="_blank" 
 className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-none text-slate-400 hover:text-blue-600 border border-slate-200/50 dark:border-white/5"
 >
 <ExternalLink size={16} />
 </a>
 </div>
 </div>
 </div>
 ))
 )}
 </motion.div>
 )}

 {activeTab === 'posts' && (
 <motion.div
 key="posts"
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="max-w-2xl mx-auto"
 >
 <div className="bg-white dark:bg-[#111114] border border-slate-200/60 dark:border-white/5 rounded-none p-10 ">
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 rounded-none bg-blue-600 flex items-center justify-center text-white ">
 <Plus size={32} />
 </div>
 <div>
 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">New Update</h3>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70">Push a new post to your Facebook Page</p>
 </div>
 </div>
 
 <div className="space-y-8">
 <div className="space-y-3">
 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
 <textarea 
 value={postMessage}
 onChange={(e) => setPostMessage(e.target.value)}
 placeholder="What would you like to share?"
 className="w-full h-56 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/10 rounded-none p-8 text-base font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none "
 />
 </div>
 <div className="space-y-3">
 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
 <LinkIcon size={14} /> Link Preview
 </label>
 <input 
 type="url"
 value={postLink}
 onChange={(e) => setPostLink(e.target.value)}
 placeholder="https://yourlink.com"
 className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/10 rounded-none px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 "
 />
 </div>

 <button
 onClick={handlePublish}
 disabled={publishing || !postMessage.trim()}
 className="w-full py-6 bg-blue-600 text-white rounded-none text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 -blue-500/30 disabled:opacity-50 flex items-center justify-center gap-4"
 >
 {publishing ? <RefreshCw size={20} className="" /> : <><Send size={20} /> Post to Page</>}
 </button>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === 'analytics' && (
 <motion.div
 key="analytics"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
 >
 {analytics.length === 0 ? (
 <div className="col-span-full py-40 text-center bg-white dark:bg-white/2 rounded-none border border-slate-200/60 dark:border-white/5">
 <BarChart3 size={64} className="mx-auto text-slate-100 dark:text-white/5 mb-6" />
 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Analyzing...</h3>
 </div>
 ) : (
 analytics.map((stat: any) => (
 <div key={stat.name} className="bg-white dark:bg-[#111114] border border-slate-200/60 dark:border-white/5 rounded-none p-8 hover: group">
 <div className="w-10 h-10 rounded-none bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white mb-6">
 <Zap size={20} />
 </div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.title || stat.name.replace(/_/g, ' ')}</p>
 <div className="flex items-end justify-between">
 <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
 {stat.values?.[0]?.value || 0}
 </h4>
 </div>
 </div>
 ))
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </main>

 {/* ── Social Feed Modal ── */}
 <AnimatePresence>
 {selectedPost && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setSelectedPost(null)}
 className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
 />
 <motion.div 
 initial={{ scale: 0.95, opacity: 0, y: 30 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 30 }}
 className="relative w-full max-w-5xl bg-white dark:bg-[#0a0a0b] rounded-none overflow-hidden flex flex-col md:flex-row h-[85vh] border border-white/10"
 >
 <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
 {selectedPost.full_picture ? (
 <img src={selectedPost.full_picture} className="max-w-full max-h-full object-contain relative z-10" />
 ) : (
 <div className="p-16 text-center">
 <Facebook size={120} className="mx-auto text-blue-600 opacity-10 mb-10" />
 <p className="text-white font-black text-2xl uppercase tracking-tighter leading-relaxed">"{selectedPost.message || selectedPost.story}"</p>
 </div>
 )}
 {/* Background Glow */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-none blur-[120px]" />
 </div>
 
 <div className="w-full md:w-[450px] flex flex-col bg-white dark:bg-[#111114]">
 <header className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 bg-blue-500 rounded-none " />
 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Conversations</h4>
 </div>
 <button onClick={() => setSelectedPost(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-none text-slate-400 hover:text-black dark:hover:text-white "><Plus size={24} className="rotate-45" /></button>
 </header>
 
 <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
 {loadingComments ? (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <RefreshCw className=" text-blue-600" size={32} />
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading feedback...</p>
 </div>
 ) : comments.length === 0 ? (
 <div className="text-center py-20">
 <MessageCircle size={48} className="mx-auto text-slate-100 dark:text-white/5 mb-6" />
 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No comments found</p>
 </div>
 ) : (
 comments.map(comment => (
 <div key={comment.id} className="group">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-xs font-black text-slate-600 dark:text-white uppercase">
 {comment.from?.name?.[0] || 'U'}
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1.5">
 <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{comment.from?.name || 'Facebook User'}</p>
 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(comment.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 </div>
 <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-none border border-slate-100 dark:border-white/5">
 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{comment.message}</p>
 </div>
 <div className="flex items-center gap-5 mt-3 ml-1">
 <button className="text-[9px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
 <Heart size={10} /> Like
 </button>
 <button className="text-[9px] font-black text-blue-500 hover:underline uppercase tracking-widest ">Reply</button>
 </div>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 
 <footer className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2">
 <div className="relative">
 <input 
 type="text" 
 value={replyText}
 onChange={(e) => setReplyText(e.target.value)}
 placeholder="Write a professional reply..."
 className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-none pl-6 pr-14 py-5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 "
 onKeyPress={(e) => e.key === 'Enter' && handleReply(comments[0]?.id)}
 />
 <button 
 onClick={() => handleReply(comments[0]?.id)}
 className="absolute right-2.5 top-2.5 w-12 h-12 bg-blue-600 text-white rounded-none hover:bg-blue-700 -blue-500/30 flex items-center justify-center"
 >
 <Send size={18} />
 </button>
 </div>
 </footer>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
}
