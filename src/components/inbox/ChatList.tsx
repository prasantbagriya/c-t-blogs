import React from 'react';
import { Search, Plus, Globe, Send, MessageSquare, Activity } from 'lucide-react';
import { Instagram, Facebook, Threads } from '../common/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';

function cn(...classes: (string | false | undefined | null)[]) {
 return classes.filter(Boolean).join(' ');
}

interface ChatListProps {
 chats: any[];
 selectedChatId: string | null;
 setSelectedChatId: (id: string) => void;
 searchQuery: string;
 setSearchQuery: (q: string) => void;
 activeFilter: string;
 setActiveFilter: (f: string) => void;
 sourceFilter: string;
 setSourceFilter: (s: string) => void;
 showStats: boolean;
 setShowStats: (s: boolean) => void;
 isNewChatMode: boolean;
 setIsNewChatMode: (m: boolean) => void;
 newChatNumber: string;
 setNewChatNumber: (n: string) => void;
 formatTime: (iso: string) => string;
 hideSourceFilters?: boolean;
}

export const ChatList = ({
 chats,
 selectedChatId,
 setSelectedChatId,
 searchQuery,
 setSearchQuery,
 activeFilter,
 setActiveFilter,
 sourceFilter,
 setSourceFilter,
 showStats,
 setShowStats,
 isNewChatMode,
 setIsNewChatMode,
 newChatNumber,
 setNewChatNumber,
 formatTime,
 hideSourceFilters = false
}: ChatListProps) => {
 return (
 <aside className={`bg-white dark:bg-[#0a0a0f] border-r border-slate-100 dark:border-white/5 flex flex-col z-20 h-full lg:relative lg:w-[320px] ${selectedChatId ? "hidden lg:flex" : "flex w-full lg:w-[320px]"}`}>
 <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
 <div className="flex items-center justify-between">
 <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Direct Messages</h2>
 <div className="flex items-center gap-1">
 <button 
 onClick={() => setShowStats(!showStats)}
 className={`p-2 rounded-none ${showStats ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
 >
 <Activity size={14} />
 </button>
 <button 
 onClick={() => setIsNewChatMode(!isNewChatMode)}
 className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-none hover:scale-105 "
 >
 <Plus size={14} className={isNewChatMode ? "rotate-45 " : ""} />
 </button>
 </div>
 </div>

 <div className="relative">
 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
 <input 
 type="text" 
 placeholder={isNewChatMode ? "Enter phone number..." : "Search messages..."}
 value={isNewChatMode ? newChatNumber : searchQuery}
 onChange={(e) => isNewChatMode ? setNewChatNumber(e.target.value) : setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-[#16161d] border-none rounded-none text-[11px] font-medium outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-white/10 text-slate-900 dark:text-white placeholder:text-slate-500"
 />
 </div>

 {!hideSourceFilters && (
 <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#16161d] rounded-none">
 {[
 { id: 'all', label: 'All', icon: <Globe size={11} /> },
 { id: 'whatsapp', label: 'WA', icon: <Send size={11} /> },
 { id: 'instagram', label: 'IG', icon: <Instagram size={11} /> },
 { id: 'threads', label: 'TH', icon: <Threads size={11} /> },
 { id: 'website', label: 'Web', icon: <MessageSquare size={11} /> }
 ].map(s => (
 <button
 key={s.id}
 onClick={() => setSourceFilter(s.id)}
 className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-none text-[9px] font-black uppercase tracking-wider ${sourceFilter === s.id ? "bg-white dark:bg-[#1f1f27] text-black dark:text-white " : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
 >
 {s.icon}
 {s.label}
 </button>
 ))}
 </div>
 )}
 </div>

 <AnimatePresence>
 {showStats && (
 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 overflow-hidden mb-2">
 <div className="p-3 bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/5 rounded-none grid grid-cols-2 gap-2 text-center ">
 <div>
 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Active Chats</p>
 <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{chats.length}</p>
 </div>
 <div>
 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Resolved</p>
 <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{chats.filter(c => c.statusLabel === 'Solved').length}</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pt-2 space-y-0.5">
 {chats.length === 0 ? (
 <div className="text-center py-20 opacity-20 select-none">
 <MessageSquare size={32} className="mx-auto mb-3" />
 <p className="text-[10px] font-black uppercase tracking-[0.2em]">No conversations</p>
 </div>
 ) : chats.map((chat: any) => {
 const isSelected = selectedChatId === chat.id;
 return (
 <button
 key={chat.id}
 onClick={() => setSelectedChatId(chat.id)}
 className={cn(
 "w-full p-3 rounded-none flex items-center gap-3 border-b border-transparent",
 isSelected 
 ? "bg-white dark:bg-[#16161d] border-slate-100 dark:border-white/5" 
 : "bg-transparent hover:bg-slate-50 dark:hover:bg-white/2"
 )}
 >
 <div className="relative flex-shrink-0">
 <div className={cn(
 "w-11 h-11 rounded-none flex items-center justify-center font-black text-sm overflow-hidden border-2 border-white dark:border-[#0a0a0f] ",
 "bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400"
 )}>
 {chat.profilePicture ? (
 <img src={chat.profilePicture} className="w-full h-full object-cover" />
 ) : (
 <span>{chat.name ? chat.name[0].toUpperCase() : 'U'}</span>
 )}
 </div>
 <div className={cn(
 "absolute -bottom-1 -right-1 w-5 h-5 rounded-none flex items-center justify-center border-2",
 "border-white dark:border-[#16161d]",
 chat.messages?.[0]?.source === 'instagram' ? "bg-pink-600" :
 chat.messages?.[0]?.source === 'threads' ? "bg-black" :
 (chat.messages?.[0]?.source === 'widget' || chat.messages?.[0]?.source === 'website') ? "bg-blue-600" : "bg-emerald-500"
 )}>
 {chat.messages?.[0]?.source === 'instagram' ? <Instagram size={10} className="text-white" /> :
 chat.messages?.[0]?.source === 'threads' ? <Threads size={10} className="text-white" /> :
 (chat.messages?.[0]?.source === 'widget' || chat.messages?.[0]?.source === 'website') ? <Globe size={10} className="text-white" /> : 
 <Send size={10} className="text-white" />}
 </div>
 </div>

 <div className="flex-1 min-w-0 text-left">
 <div className="flex justify-between items-start">
 <h4 className="text-[13px] font-black truncate text-slate-900 dark:text-white tracking-tight">
 {chat.name}
 </h4>
 <span className="text-[9px] font-bold text-slate-400 shrink-0">
 {formatTime(chat.lastTime)}
 </span>
 </div>
 <div className="flex justify-between items-center mt-0.5 gap-2">
 <p className="text-[11px] truncate text-slate-500 dark:text-slate-400 flex-1 font-medium leading-none">
 {chat.lastMsg}
 </p>
 <div className="flex items-center gap-1.5 shrink-0">
 {chat.unreadCount > 0 && (
 <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-none bg-black dark:bg-white text-white dark:text-black text-[9px] font-black ">
 {chat.unreadCount}
 </span>
 )}
 <div className={cn(
 "w-1.5 h-1.5 rounded-none",
 chat.statusLabel === 'Needs Agent' ? "bg-amber-500" : "bg-emerald-500"
 )} />
 </div>
 </div>
 </div>
 </button>
 );
 })}
 </div>
 </aside>
 );
};
