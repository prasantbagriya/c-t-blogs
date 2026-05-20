import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { API_URL, getHeaders } from '../../api/common';
import { motion, AnimatePresence } from 'motion/react';

export const ThreadsInbox = ({ user, account }: { user: any, account: any }) => {
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
      const res = await fetch(`${API_URL}/threads/conversations?accountId=${account.id}`, { headers: getHeaders() });
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
      const res = await fetch(`${API_URL}/threads/messages?accountId=${account.id}&conversationId=${convId}`, { headers: getHeaders() });
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
    
    // Optimistic UI
    const tempId = Date.now().toString();
    const newMsg = {
        id: tempId,
        text: replyText,
        created_time: new Date().toISOString(),
        from: { username: account.username, id: account.threadsId }
    };
    setMessages(prev => [...prev, newMsg]);
    const txt = replyText;
    setReplyText('');

    try {
      const recipientId = selectedConversation.participants.data.find((p: any) => p.id !== account.threadsId)?.id;
      const res = await fetch(`${API_URL}/threads/send-dm`, {
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
      alert('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setReplyText(txt);
    }
  };

  if (needsReconnect) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Messaging permission required</h2>
        <p className="text-sm text-slate-500 max-w-md">Threads Messaging is a new feature. You need to reconnect your account to grant "Direct Messaging" permissions.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] tracking-widest shadow-lg shadow-blue-500/20"
          >
            Reconnect account
          </button>
          <button 
            onClick={() => (window as any).setActiveTab?.('overview')}
            className="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl font-black text-[10px] tracking-widest"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col sm:flex-row bg-white dark:bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar: Conversations */}
      <div className="w-full sm:w-80 border-r border-slate-100 dark:border-white/5 flex flex-col h-full bg-slate-50/50 dark:bg-black/20">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Messages</h2>
           <button onClick={fetchConversations} className="p-2 text-slate-400 hover:text-blue-500 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading && conversations.length === 0 ? (
            <div className="p-8 text-center"><RefreshCw className="animate-spin mx-auto text-slate-300" size={24} /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center opacity-30">
               <MessageSquare className="mx-auto mb-2" size={32} />
               <p className="text-[10px] font-bold uppercase tracking-widest">No chats yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 cursor-pointer border-b border-slate-100 dark:border-white/5 transition-all flex items-center gap-3 ${selectedConversation?.id === conv.id ? 'bg-white dark:bg-[#16161d] shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
              >
                <div className="w-10 h-10 bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                   <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {conv.participants?.data?.find((p: any) => p.id !== account.threadsId)?.username || 'User'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 shrink-0">
                        {new Date(conv.updated_time).toLocaleDateString()}
                      </span>
                   </div>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.messages?.data?.[0]?.text || 'Started a conversation'}
                   </p>
                </div>
                {conv.unread_count > 0 && (
                   <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-[#0a0a0f]">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-white/80 dark:bg-black/20 backdrop-blur-md">
               <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {selectedConversation.participants?.data?.find((p: any) => p.id !== account.threadsId)?.username?.[0]?.toUpperCase()}
               </div>
               <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    @{selectedConversation.participants?.data?.find((p: any) => p.id !== account.threadsId)?.username}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Chat</span>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
               {msgLoading && messages.length === 0 ? (
                 <div className="flex items-center justify-center h-full"><RefreshCw className="animate-spin text-slate-200" /></div>
               ) : (
                 messages.map(msg => {
                   const isMe = msg.from?.id === account.threadsId;
                   return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-[#16161d] text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                           {msg.text}
                           <div className={`text-[8px] mt-1.5 opacity-50 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
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
                    className="flex-1 bg-slate-100 dark:bg-[#16161d] border-none rounded-xl px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Send size={18} />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none">
             <MessageSquare size={64} className="mb-4" />
             <p className="text-xs font-black uppercase tracking-[0.3em]">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
