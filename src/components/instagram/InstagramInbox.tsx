import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import { API_URL, getHeaders } from '../../api/common';
import { motion, AnimatePresence } from 'motion/react';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export const InstagramInbox = ({ user, account }: { user: any, account: any, messages?: any[] }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/instagram/conversations?accountId=${account.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
        setNeedsReconnect(!!data.needsReconnect);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setMsgLoading(true);
    try {
      const res = await fetch(`${API_URL}/instagram/messages?accountId=${account.id}&conversationId=${convId}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages.reverse() || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [account]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    const tempId = Date.now().toString();
    const newMsg = {
        id: tempId,
        text: replyText,
        created_time: new Date().toISOString(),
        from: { username: account.username, id: account.instagramId }
    };
    setMessages(prev => [...prev, newMsg]);
    const txt = replyText;
    setReplyText('');

    try {
      const recipientId = selectedConversation.participants?.data?.find((p: any) => p.id !== account.instagramId)?.id;
      const res = await fetch(`${API_URL}/instagram/send-dm`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          recipientId,
          text: txt
        })
      });
      if (!res.ok) throw new Error('Failed to send');
    } catch (e) {
      (window as any).showToast?.('Failed to send message', 'error');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setReplyText(txt);
    }
  };

  if (needsReconnect) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0a0a0f]">
        <div className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Messaging permission required</h2>
        <p className="text-sm text-slate-500 max-w-md mt-2">To manage your Instagram Direct Messages, you need to grant "Direct Messaging" permissions via Meta Business Suite.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 bg-pink-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20"
        >
          Reconnect account
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col sm:flex-row bg-white dark:bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar: Conversations */}
      <div className="w-full sm:w-80 border-r border-slate-100 dark:border-white/5 flex flex-col h-full bg-slate-50/50 dark:bg-black/20">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Messages</h2>
           <button onClick={fetchConversations} className="p-2 text-slate-400 hover:text-pink-500 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading && conversations.length === 0 ? (
            <div className="p-8 text-center"><RefreshCw className="animate-spin mx-auto text-slate-300" size={24} /></div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center opacity-30">
               <MessageSquare className="mx-auto mb-2 text-pink-500" size={32} />
               <p className="text-[10px] font-black uppercase tracking-widest">No chats yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "p-4 cursor-pointer border-b border-slate-100 dark:border-white/5 transition-all flex items-center gap-3",
                  selectedConversation?.id === conv.id ? 'bg-white dark:bg-[#16161d] shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'
                )}
              >
                <div className="w-11 h-11 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-md font-black text-sm">
                   {conv.participants?.data?.find((p: any) => p.id !== account.instagramId)?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                        {conv.participants?.data?.find((p: any) => p.id !== account.instagramId)?.username || 'User'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 shrink-0">
                        {new Date(conv.updated_time).toLocaleDateString()}
                      </span>
                   </div>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                      {conv.messages?.data?.[0]?.text || 'Started a conversation'}
                   </p>
                </div>
                {conv.unread_count > 0 && (
                   <div className="w-2 h-2 bg-pink-500 rounded-full" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-[#050505]">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-white/80 dark:bg-black/20 backdrop-blur-md">
               <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-md">
                  {selectedConversation.participants?.data?.find((p: any) => p.id !== account.instagramId)?.username?.[0]?.toUpperCase()}
               </div>
               <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    @{selectedConversation.participants?.data?.find((p: any) => p.id !== account.instagramId)?.username}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Chat</span>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 relative">
               <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]" 
                    style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }} />
               <div className="relative z-10 flex flex-col space-y-2">
               {msgLoading && messages.length === 0 ? (
                 <div className="flex items-center justify-center h-full"><RefreshCw className="animate-spin text-blue-500" /></div>
               ) : (
                 messages.map(msg => {
                   const isMe = msg.from?.id === account.instagramId;
                   return (
                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={cn(
                          "max-w-[85%] lg:max-w-[70%] px-3 py-1.5 rounded-xl text-[13px] font-medium shadow-sm leading-snug",
                          isMe ? "bg-black dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-[#16161d] text-slate-900 dark:text-slate-200"
                        )}>
                           <p className="m-0 break-words whitespace-pre-wrap">{msg.text}</p>
                           <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end text-white/50 dark:text-black/50' : 'text-slate-500 dark:text-slate-400'}`}>
                              <span className="text-[9px] font-bold uppercase tracking-tighter">
                                {new Date(msg.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
               </div>
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black/20">
               <div className="relative flex items-center gap-2">
                  <input 
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 dark:bg-[#16161d] border-none rounded-xl px-4 py-3 text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-500 outline-none"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="p-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10 dark:shadow-white/10"
                  >
                    <Send size={18} strokeWidth={3} />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none p-10 text-center">
             <MessageSquare size={64} className="mb-4 text-pink-500" />
             <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
