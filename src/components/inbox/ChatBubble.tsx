import React from 'react';
import { Check, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatBubbleProps {
 msg: any;
 isMe: boolean;
 showDatePill: boolean;
 dateLabel: string;
 formatTime: (iso: string) => string;
 pageChanged: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
 msg,
 isMe,
 showDatePill,
 dateLabel,
 formatTime,
 pageChanged
}) => {
 return (
 <div className="flex flex-col space-y-1">
 {showDatePill && (
 <div className="flex justify-center my-4 sticky top-2 z-20">
 <span className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-none text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
 {dateLabel}
 </span>
 </div>
 )}

 <motion.div
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
 >
 <div className={`relative max-w-[85%] lg:max-w-[70%]`}>
 {!isMe && msg.senderName && msg.senderName !== 'Visitor' && (
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1 block">
 {msg.senderName}
 </span>
 )}

 <div className={` px-3 py-1.5 rounded-none text-[13px] font-medium leading-snug ${isMe ? "bg-black dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-[#16161d] text-slate-900 dark:text-slate-200"} `}>
 <p className="m-0 break-words whitespace-pre-wrap">
 {msg.text}
 </p>

 <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end text-white/50 dark:text-black/50' : 'text-slate-500 dark:text-slate-400'}`}>
 <span className="text-[9px] font-bold uppercase tracking-tighter">{formatTime(msg.timestamp)}</span>
 {isMe && (
 <div className="flex items-center">
 <Check size={10} strokeWidth={4} />
 </div>
 )}
 </div>
 </div>
 </div>

 {pageChanged && msg.pageUrl && (
 <div className="mt-2 mb-2 self-center flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-none border border-slate-200 dark:border-white/5">
 <Globe size={11} className="text-slate-400" />
 <a
 href={msg.pageUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
 >
 {(() => { try { return new URL(msg.pageUrl).pathname || 'Home Page'; } catch { return msg.pageUrl; } })()}
 </a>
 </div>
 )}
 </motion.div>
 </div>
 );
};
