import React from 'react';
import {
 MessageSquare,
 Image as ImageIcon,
 Video,
 FileText,
 ExternalLink,
 Phone,
 Check,
 Copy as CopyIcon
} from 'lucide-react';

type HeaderType = 'None' | 'Text' | 'Image' | 'Video' | 'Document';

export const WhatsAppPreview = ({ 
 headerType, 
 headerText, 
 content, 
 footer, 
 buttons,
 mediaUrl,
 accountName,
 isVerified,
 templateId,
 bodyText
}: { 
 headerType: HeaderType, 
 headerText?: string, 
 content?: string, 
 footer?: string, 
 buttons: any[],
 mediaUrl?: string,
 accountName?: string,
 isVerified?: boolean,
 templateId?: string,
 bodyText?: string
}) => {
 const displayContent = content || bodyText || '';
 
 const formatContent = (text: string) => {
 if (!text) return <span className="text-slate-500 italic">Your message body will appear here...</span>;
 
 let parts: (string | React.ReactNode)[] = text.split(/(\{\{\d+\}\})/g).map((part, i) => {
 if (typeof part === 'string' && part.match(/\{\{\d+\}\}/)) {
 return <span key={`v-${i}`} className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1 rounded-none font-bold">{part}</span>;
 }
 return part;
 });

 const styleParts = (content: string | React.ReactNode): (string | React.ReactNode)[] => {
 if (typeof content !== 'string') return [content];
 
 const process = (text: string): (string | React.ReactNode)[] => {
 const boldRegex = /\*([^*]+)\*/g;
 const italicRegex = /_([^_]+)_/g;
 const strikeRegex = /~([^~]+)~/g;

 let res: (string | React.ReactNode)[] = [text];

 const applyStyle = (items: (string | React.ReactNode)[], regex: RegExp, wrapper: (inner: string) => React.ReactNode) => {
 let next: (string | React.ReactNode)[] = [];
 items.forEach(item => {
 if (typeof item !== 'string') {
 next.push(item);
 return;
 }
 const segments = item.split(regex);
 segments.forEach((seg, idx) => {
 if (idx % 2 === 1) next.push(wrapper(seg));
 else if (seg) next.push(seg);
 });
 });
 return next;
 };

 res = applyStyle(res, boldRegex, (s) => <strong key={Math.random()} className="font-bold">{s}</strong>);
 res = applyStyle(res, italicRegex, (s) => <em key={Math.random()} className="italic">{s}</em>);
 res = applyStyle(res, strikeRegex, (s) => <del key={Math.random()} className="line-through">{s}</del>);
 
 return res;
 };

 return process(content);
 };

 let FinalParts: (string | React.ReactNode)[] = [];
 parts.forEach(p => {
 if (typeof p === 'string') FinalParts.push(...styleParts(p));
 else FinalParts.push(p);
 });

 return FinalParts;
 };

 return (
 <div className="w-full max-w-[300px] mx-auto bg-[#e5ddd5] dark:bg-[#0b141a] rounded-none border-[8px] border-slate-900 dark:border-[#202c33] aspect-[9/18.5] overflow-hidden relative flex flex-col scale-[0.95] origin-top">
 {/* Phone Notch */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 dark:bg-[#202c33] rounded-none-2xl z-20 flex items-center justify-center">
 <div className="w-10 h-1 bg-slate-800 rounded-none" />
 </div>

 {/* Status Bar Background */}
 <div className="h-8 bg-[#075e54] dark:bg-[#202c33] shrink-0" />

 {/* WhatsApp Header */}
 <div className="bg-[#075e54] dark:bg-[#202c33] pt-0 pb-3 px-4 flex items-center gap-3 relative z-10 ">
 <div className="w-8 h-8 rounded-none bg-slate-200 flex items-center justify-center text-[10px] font-bold uppercase text-slate-600 border border-white/10">
 {accountName?.charAt(0) || 'W'}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-white text-[11px] font-bold flex items-center gap-1 truncate">
 {accountName || 'WhatsApp Business'}
 {isVerified && (
 <span className="w-3 h-3 bg-blue-500 rounded-none flex items-center justify-center shrink-0">
 <Check size={8} className="text-white" strokeWidth={5} />
 </span>
 )}
 </p>
 <p className="text-[#9de1fe] dark:text-[#8696a0] text-[8px] font-medium tracking-wide">
 {templateId ? `Template: ${templateId}` : 'Online'}
 </p>
 </div>
 </div>

 {/* Chat Content */}
 <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-[url('https://chatwizs.com/assets/wa-bg-light.png')] dark:bg-none bg-repeat">
 <div className="bg-white dark:bg-[#202c33] rounded-none border-none p-0 max-w-[90%] relative overflow-hidden fade-in slide-in-from-left-2 ">
 
 {headerType !== 'None' && (
 <div className="w-full">
 {headerType === 'Text' ? (
 <div className="p-3 pb-0">
 <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
 {headerText || 'HEADER'}
 </p>
 </div>
 ) : (
 <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-50 dark:border-white/5">
 {headerType === 'Image' && (
 mediaUrl ? (
 <img src={mediaUrl} className="w-full h-full object-cover" alt="Header" />
 ) : (
 <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
 )
 )}
 {headerType === 'Video' && (
 mediaUrl ? (
 <video src={mediaUrl} className="w-full h-full object-cover" />
 ) : (
 <Video className="w-8 h-8 text-slate-400 dark:text-slate-600" />
 )
 )}
 {headerType === 'Document' && (
 <div className="flex flex-col items-center gap-2">
 <FileText className="w-8 h-8 text-blue-500" />
 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">PDF DOCUMENT</p>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 <div className="p-3">
 <div className="text-[11px] text-slate-900 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
 {formatContent(displayContent)}
 </div>

 {footer && (
 <div className="mt-2 pt-1.5 border-t border-slate-50 dark:border-white/5">
 <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">{footer}</p>
 </div>
 )}

 <div className="flex justify-end mt-1 items-center gap-1">
 <span className="text-[7px] text-slate-400 font-medium">
 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 <Check size={8} className="text-blue-500" />
 </div>
 </div>
 </div>

 {/* Buttons Section */}
 {buttons && buttons.length > 0 && (
 <div className="space-y-1 px-1 pb-4">
 {buttons.map((btn, idx) => (
 <div 
 key={idx} 
 className="bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-sm py-2.5 px-4 rounded-none border border-white/10 flex items-center justify-center gap-2 text-blue-500 dark:text-blue-400 text-[10px] font-bold cursor-default hover:bg-white "
 >
 {btn.ctaType === 'Visit Website' && <ExternalLink size={12} strokeWidth={2.5} />}
 {btn.ctaType === 'Call Phone Number' && <Phone size={12} strokeWidth={2.5} />}
 {btn.otpType === 'Copy Code' && <CopyIcon size={12} strokeWidth={2.5} />}
 {btn.type === 'Quick Reply' && <MessageSquare size={12} strokeWidth={2.5} />}
 {btn.text || 'Action Button'}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Phone Navigation Bar */}
 <div className="h-6 bg-slate-900 dark:bg-[#202c33] flex items-center justify-center">
 <div className="w-20 h-1 bg-slate-700 rounded-none" />
 </div>
 </div>
 );
};
