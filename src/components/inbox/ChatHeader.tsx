import React from 'react';
import { ArrowLeft, CheckCircle2, MoreVertical, Globe, Phone } from 'lucide-react';

interface ChatHeaderProps {
  selectedChat: any;
  onBack: () => void;
  onResolve: () => void;
  onToggleProfile: () => void;
  isUpdatingLead: boolean;
  isDarkMode: boolean;
}

export const ChatHeader = ({
  selectedChat,
  onBack,
  onResolve,
  onToggleProfile,
  isUpdatingLead,
  isDarkMode
}: ChatHeaderProps) => {
  if (!selectedChat) return null;

  const isWidget = selectedChat?.messages?.[0]?.source === 'widget' || selectedChat?.messages?.[0]?.source === 'website';

  return (
    <header className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-black/20 backdrop-blur-xl z-40">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onBack} 
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-sm shadow-md border-2 border-white dark:border-[#0a0a0f]">
            {selectedChat?.name && isNaN(Number(selectedChat.name[0])) ? selectedChat.name[0].toUpperCase() : (selectedChat?.phone ? '#' : 'U')}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0f] ${isWidget ? "bg-blue-600" : "bg-emerald-500"}`}>
            {isWidget ? <Globe size={8} className="text-white" /> : <Phone size={8} className="text-white" />}
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight truncate tracking-tight">
            {selectedChat?.name || 'User'}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isWidget ? "bg-blue-600 animate-pulse" : "bg-emerald-500"}`} />
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.15em]">
              {isWidget ? 'Live Visitor' : 'Active Chat'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onResolve}
          disabled={isUpdatingLead}
          className="flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-black/5"
        >
          <CheckCircle2 size={12} />
          <span className="hidden sm:inline">Resolve</span>
        </button>
        <button
          onClick={onToggleProfile}
          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
};
