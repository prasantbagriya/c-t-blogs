import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MessageSquare,
  ArrowLeft,
  Zap,
  Globe,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendMessage, getAISuggestion, updateDoc, addDoc, db, collection, query, where, onSnapshot, API_URL } from '../api';

// New Modular Components
import { ChatList } from './inbox/ChatList';
import { ChatHeader } from './inbox/ChatHeader';
import { ChatInput } from './inbox/ChatInput';
import { ChatBubble } from './inbox/ChatBubble';
import { ChatProfile } from './inbox/ChatProfile';
import { Smartphone, LayoutGrid, ChevronRight, Search, Settings } from 'lucide-react';

interface InboxViewProps {
  user: any;
  messages: any[];
  platform?: 'whatsapp' | 'instagram' | 'all' | 'widget' | 'threads';
  selectedAccount?: any;
  isDarkMode: boolean;
  onChatToggle?: (active: boolean) => void;
  onBack?: () => void;
  initialChatId?: string | null;
}

export const InboxView = ({
  user,
  messages,
  platform = 'all',
  selectedAccount,
  isDarkMode,
  onChatToggle,
  onBack,
  initialChatId
}: InboxViewProps) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);
  const [view, setView] = useState<'selection' | 'chat'>('chat');
  const [selectedChannel, setSelectedChannel] = useState<{ type: 'whatsapp' | 'instagram' | 'website' | 'threads', id: string, name: string } | null>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [inboxSelectedAccount, setInboxSelectedAccount] = useState<any>(selectedAccount || null);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'whatsapp' | 'website' | 'instagram' | 'threads'>('all');
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Auto-select channel if selectedAccount is provided from parent
  useEffect(() => {
    if (selectedAccount) {
      setSelectedChannel({ 
        type: platform === 'all' ? (selectedAccount.platform || 'whatsapp') : (platform as any), 
        id: selectedAccount.id, 
        name: selectedAccount.username || selectedAccount.phoneNumber || selectedAccount.name || 'Account' 
      });
      setView('chat');
    }
  }, [selectedAccount, platform]);

  // Fetch Channels (Widgets & Accounts)
  useEffect(() => {
    if (!user?.uid) return;
    const effectiveUid = user.parentId || user.uid;

    const unsubWidgets = onSnapshot(query(collection(db, 'widget_settings'), where('uid', '==', effectiveUid)), (snap) => {
      const fetchedWidgets = snap.docs.map(doc => ({ id: doc.id, type: 'website', ...doc.data() }));
      setWidgets(fetchedWidgets);

      // ── Handle Pre-selection ──
      const preselect = (window as any).inboxPreselect;
      if (preselect) {
        setSelectedChannel(preselect);
        setView('chat');
        delete (window as any).inboxPreselect; // Cleanup
      }
    });

    const unsubAccs = onSnapshot(query(collection(db, 'whatsapp_accounts'), where('uid', '==', effectiveUid)), (snap) => {
      setAccounts(prev => {
        const otherTypeAccs = prev.filter(a => a.type !== 'whatsapp');
        return [...otherTypeAccs, ...snap.docs.map(doc => ({ id: doc.id, type: 'whatsapp', ...doc.data() }))];
      });
    });

    const unsubIgAccs = onSnapshot(query(collection(db, 'instagram_accounts'), where('uid', '==', effectiveUid)), (snap) => {
      setAccounts(prev => {
        const otherTypeAccs = prev.filter(a => a.type !== 'instagram');
        return [...otherTypeAccs, ...snap.docs.map(doc => ({ id: doc.id, type: 'instagram', ...doc.data() }))];
      });
    });

    const unsubThAccs = onSnapshot(query(collection(db, 'threads_accounts'), where('uid', '==', effectiveUid)), (snap) => {
      setAccounts(prev => {
        const otherTypeAccs = prev.filter(a => a.type !== 'threads');
        return [...otherTypeAccs, ...snap.docs.map(doc => ({ id: doc.id, type: 'threads', ...doc.data() }))];
      });
    });

    return () => { unsubWidgets(); unsubAccs(); unsubIgAccs(); unsubThAccs(); };
  }, [user]);

  const allMessages = useMemo(() => {
     const validOptimistic = optimisticMessages.filter(o => 
       !messages.some((m: any) => m.text === o.text && Math.abs(new Date(m.timestamp).getTime() - new Date(o.timestamp).getTime()) < 10000)
     );
     return [...messages, ...validOptimistic];
  }, [messages, optimisticMessages]);

  const chatGroups = useMemo(() => allMessages.reduce((acc: any, msg: any) => {
    // ── STRICT CHANNEL ISOLATION ──
    if (selectedChannel) {
      if (selectedChannel.type === 'whatsapp') {
        if (msg.source !== 'whatsapp' || msg.whatsappAccountId !== selectedChannel.id) return acc;
      }
      if (selectedChannel.type === 'instagram') {
        if (msg.source !== 'instagram' || msg.instagramAccountId !== selectedChannel.id) return acc;
      }
      if (selectedChannel.type === 'website') {
         const isMatch = (msg.source === 'website' || msg.source === 'widget') && (msg.widgetId === selectedChannel.id);
         if (!isMatch) return acc;
      }
      if (selectedChannel.type === 'threads') {
        if (msg.source !== 'threads' || msg.threadsAccountId !== selectedChannel.id) return acc;
      }
    } else {
      // If no channel is selected but we are in 'chat' view (shouldn't happen with new UI), 
      // still apply global filters
      const effectiveAccount = inboxSelectedAccount || selectedAccount;
      if (effectiveAccount && msg.source === 'whatsapp' && msg.whatsappAccountId && msg.whatsappAccountId !== effectiveAccount.id) return acc;

      if (sourceFilter !== 'all') {
        const isWebsiteMatch = sourceFilter === 'website' && (msg.source === 'website' || msg.source === 'widget');
        if (!isWebsiteMatch && msg.source !== sourceFilter) return acc;
      }

      if (platform !== 'all' && platform !== 'widget') {
        const msgPlatform = msg.source === 'whatsapp' ? 'whatsapp' : (msg.source === 'instagram' ? 'instagram' : (msg.source === 'threads' ? 'threads' : 'website'));
        if (msgPlatform !== platform) return acc;
      }
    }

    // ── CORRECT CHAT ID RESOLUTION ──
    // ChatId should always be the ID of the CUSTOMER (non-admin side)
    const customerId = msg.sender === 'admin' ? msg.recipient : msg.sender;
    const cleanPhone = (msg.source === 'whatsapp') ? customerId?.replace(/\D/g, '') : '';
    
    // Fallback chain: visitorId > chatId > cleaned phone > customerId
    const chatId = msg.visitorId || msg.chatId || cleanPhone || customerId || 'unknown_contact';

    if (!acc[chatId]) {
      acc[chatId] = {
        id: chatId,
        name: msg.senderName || (cleanPhone ? `+${cleanPhone}` : chatId),
        phone: cleanPhone || chatId,
        lastMsg: msg.text,
        lastTime: msg.timestamp,
        unreadCount: 0,
        messages: [],
        assignedTo: msg.assignedTo || null,
        assignedName: msg.assignedName || null,
        needsHuman: false,
      };
    }
    acc[chatId].messages.push(msg);
    if (msg.sender !== 'admin' && (msg.unread === true || msg.unread === 'true')) {
      acc[chatId].unreadCount++;
    }
    if (msg.assignedTo) {
      acc[chatId].assignedTo = msg.assignedTo;
      acc[chatId].assignedName = msg.assignedName;
    }
    if (msg.needsHuman) acc[chatId].needsHuman = true;

    const now = new Date();
    const lastMsgTime = new Date(acc[chatId].lastTime);
    const diffMin = (now.getTime() - lastMsgTime.getTime()) / (1000 * 60);
    const lastMsg = acc[chatId].messages[acc[chatId].messages.length - 1];

    if (acc[chatId].needsHuman) {
      acc[chatId].statusLabel = 'Needs Agent';
      acc[chatId].statusColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    } else if (lastMsg.sender === 'visitor' && lastMsg.isFlowHandled) {
      acc[chatId].statusLabel = 'Automated';
      acc[chatId].statusColor = 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    } else if (diffMin > 5) {
      acc[chatId].statusLabel = lastMsg.sender === 'admin' ? 'Inactive' : 'Not Responding';
      acc[chatId].statusColor = lastMsg.sender === 'admin' ? 'bg-slate-100 text-slate-500' : 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    } else {
      acc[chatId].statusLabel = lastMsg.sender === 'admin' ? 'Waiting' : 'New Action';
      acc[chatId].statusColor = lastMsg.sender === 'admin' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500';
    }

    return acc;
  }, {}), [allMessages, inboxSelectedAccount, selectedAccount, sourceFilter, platform]);

  const chats = useMemo(() => Object.values(chatGroups)
    .filter((c: any) => {
      if (viewFilter === 'mine') {
        const isMine = c.assignedTo === user.uid || c.assignedName === user.displayName;
        if (!isMine) return false;
      }
      if (viewFilter === 'unassigned' && c.assignedTo) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return c.name?.toLowerCase().includes(query) || c.phone?.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a: any, b: any) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()), [chatGroups, viewFilter, user.uid, user.displayName, searchQuery]);

  const activeChatId = useMemo(() => {
    return isNewChatMode && newChatNumber.replace(/\D/g, '') ? newChatNumber.replace(/\D/g, '') : selectedChatId;
  }, [isNewChatMode, newChatNumber, selectedChatId]);

  const selectedChat = useMemo(() => {
    if (!activeChatId) return null;
    return chats.find((c: any) => c.id === activeChatId || c.visitorId === activeChatId || c.phone === activeChatId) as any;
  }, [chats, activeChatId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChatId, messages, optimisticMessages]);

  useEffect(() => {
    onChatToggle?.(!!selectedChatId);
  }, [selectedChatId, onChatToggle]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (!selectedChatId || !selectedChat?.messages) return;
    
    // Only mark messages from the VISITOR as read when the admin opens the chat
    const unreadFromVisitor = selectedChat.messages.filter((m: any) => m.sender !== 'admin' && (m.unread === true || m.unread === 'true'));
    if (unreadFromVisitor.length > 0) {
      unreadFromVisitor.forEach((m: any) => {
        updateDoc(`messages/${m.id}`, { unread: false }).catch(err => console.error('Error marking read:', err));
      });
    }
  }, [selectedChatId, selectedChat?.messages?.length]);

  const filteredMessages = useMemo(() => (selectedChat?.messages || [])
    .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [selectedChat]);

  const formatTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // --- Handlers ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId) return;
    const msgSource = selectedChat?.messages?.[0]?.source || (selectedChannel?.type === 'website' ? 'widget' : selectedChannel?.type) || 'whatsapp';
    const isWidget = msgSource === 'widget' || msgSource === 'website';
    const source = isWidget ? 'widget' : msgSource;
    const originalText = inputText;
    setInputText('');

    const optimisticMsg = {
      id: 'opt_' + Date.now(),
      recipient: activeChatId,
      text: originalText,
      sender: 'admin',
      senderName: user?.displayName || 'Admin',
      source: source,
      chatId: selectedChatId || activeChatId,
      widgetId: selectedChannel?.id || selectedChat?.widgetId,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setOptimisticMessages(prev => [...prev, optimisticMsg]);

    try {
      if (isWidget) {
        const res = await fetch(`${API_URL}/messages/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('chatwiz_token')}` },
          body: JSON.stringify({ 
            recipient: activeChatId, 
            widgetId: selectedChannel?.id || selectedChat?.widgetId,
            text: originalText, 
            source: 'widget'
          })
        });
        if (!res.ok) {
           const errorData = await res.json();
           throw new Error(errorData.error || 'Failed to send message');
        }
      } else {
        const accountId = selectedChat?.messages?.find((m: any) => m.whatsappAccountId || m.instagramAccountId || m.threadsAccountId)?.[
          source === 'instagram' ? 'instagramAccountId' : (source === 'threads' ? 'threadsAccountId' : 'whatsappAccountId')
        ];
        
        await sendMessage(
          activeChatId, 
          originalText, 
          source, 
          selectedChatId || undefined, 
          source === 'whatsapp' ? accountId : undefined,
          undefined, undefined, undefined, undefined,
          source === 'instagram' ? accountId : undefined,
          source === 'threads' ? accountId : undefined
        );
      }
      
      const cleanPhone = selectedChat?.phone || activeChatId;
      await updateDoc(`cm-c/${cleanPhone}`, { status: 'human', handoffUntil: new Date(Date.now() + 10*60000).toISOString(), lastInteraction: new Date().toISOString() });
    } catch (e: any) {
      alert("Failed to send: " + e.message);
      setInputText(originalText);
    }
  };

  const handleSuggestReply = async () => {
    if (aiLoading || !selectedChat) return;
    setAiLoading(true);
    try {
      const context = selectedChat.messages.slice(-5).map((m: any) => ({ sender: m.sender, text: m.text }));
      const suggestion = await getAISuggestion(context);
      setInputText(suggestion);
    } catch (err) { console.error('AI error:', err); } finally { setAiLoading(false); }
  };

  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const handleAcceptChat = async () => {
    if (!selectedChat) return;
    setIsUpdatingLead(true);
    try {
      const cleanPhone = selectedChat.phone || selectedChat.id;
      await updateDoc(`cm-c/${cleanPhone}`, { assignedTo: user.uid, assignedName: user.displayName || 'Agent', status: 'Active' });
      const handoffMessages = selectedChat.messages.filter((m: any) => m.needsHuman);
      for (const msg of handoffMessages) if (msg.id) await updateDoc(`ms-c/${msg.id}`, { needsHuman: false });
      (window as any).showToast("Chat accepted", "success");
    } catch (err) { console.error(err); } finally { setIsUpdatingLead(false); }
  };

  const handleResolveChat = async () => {
    if (!selectedChat || !confirm('Resolve this conversation?')) return;
    try {
      const cleanPhone = selectedChat.phone || selectedChat.id;
      await updateDoc(`cm-c/${cleanPhone}`, { status: 'Solved', resolvedAt: new Date().toISOString() });
      setSelectedChatId(null);
    } catch (err) { console.error(err); }
  };



  return (
    <div className="flex flex-1 w-full h-full min-h-0 bg-slate-50 dark:bg-[#0f0f13] overflow-hidden">
      <div className="flex-1 flex flex-col w-full min-h-0">

        
        <div className="flex-1 flex overflow-hidden">
          <ChatList 
            chats={chats}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            sourceFilter={selectedChannel ? selectedChannel.type : sourceFilter}
            setSourceFilter={setSourceFilter}
            hideSourceFilters={!!selectedChannel}
            showStats={showStats}
            setShowStats={setShowStats}
            isNewChatMode={isNewChatMode}
            setIsNewChatMode={setIsNewChatMode}
            newChatNumber={newChatNumber}
            setNewChatNumber={setNewChatNumber}
            formatTime={formatTime}
          />

          <main className={`flex-1 min-h-0 flex flex-col bg-white dark:bg-[#16161d] overflow-hidden relative transition-all duration-300 ${selectedChatId ? "flex" : "hidden lg:flex"}`}>
            {selectedChatId ? (
              <>
                <ChatHeader 
                  selectedChat={selectedChat}
                  onBack={() => { setSelectedChatId(null); setIsNewChatMode(false); }}
                  onResolve={handleResolveChat}
                  onToggleProfile={() => setShowProfile(!showProfile)}
                  isUpdatingLead={isUpdatingLead}
                  isDarkMode={isDarkMode}
                />

                <div
                  ref={scrollRef}
                  className="flex-1 space-y-1 overflow-y-auto no-scrollbar flex flex-col relative py-1 sm:py-2 px-0"
                  style={{ backgroundColor: isDarkMode ? '#050505' : '#f8fafc' }}
                >
                  {/* Premium Background Overlay */}
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]" 
                       style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }} />



                  {selectedChat?.needsHuman && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-20 mx-auto w-full max-w-md p-2">
                      <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-amber-500/20">
                        <Zap size={20} className="text-white animate-pulse" />
                        <div className="flex-1">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest">Needs Live Agent</p>
                          <p className="text-white/80 text-[10px] font-medium leading-tight">Automation paused for human takeover.</p>
                        </div>
                        <button onClick={handleAcceptChat} className="px-4 py-2 bg-white text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md">Accept</button>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2 pb-24 z-10">
                    {filteredMessages.map((msg: any, idx: number) => {
                      const isMe = msg.direction === 'outbound' || msg.sender === 'admin' || msg.senderName === 'Me';
                      const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
                      const showDatePill = !prevMsg || new Date(msg.timestamp).toLocaleDateString() !== new Date(prevMsg.timestamp).toLocaleDateString();
                      return (
                        <ChatBubble
                          key={msg.id || idx}
                          msg={msg}
                          isMe={isMe}
                          showDatePill={showDatePill}
                          dateLabel={new Date(msg.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(msg.timestamp).toLocaleDateString()}
                          formatTime={formatTime}
                          pageChanged={msg.pageUrl && (!prevMsg || prevMsg.pageUrl !== msg.pageUrl)}
                        />
                      );
                    })}
                  </div>

                </div>

                {/* Floating AI Suggestion Button (Enhanced visibility) */}
                <div className="absolute bottom-[75px] left-6 z-50">
                  <button
                    onClick={handleSuggestReply}
                    disabled={aiLoading}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-500/40 transition-all hover:scale-110 flex items-center justify-center border-2 border-white dark:border-[#16161d]"
                    title="AI Sparkles"
                  >
                    {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>

                <ChatInput 
                  inputText={inputText}
                  setInputText={setInputText}
                  onSendMessage={handleSendMessage}
                  onSuggestReply={handleSuggestReply}
                  aiLoading={aiLoading}
                  isEmojiPickerOpen={isEmojiPickerOpen}
                  setIsEmojiPickerOpen={setIsEmojiPickerOpen}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 mb-8 bg-blue-600/5 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                  <MessageSquare className="w-10 h-10 text-blue-500/40 dark:text-white/20" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Select a Conversation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[240px] leading-relaxed uppercase tracking-widest font-bold opacity-60">Pick a stream from the left to start intelligence orchestration.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showProfile && selectedChat && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-[350px] bg-white dark:bg-[#111b21] z-50 shadow-2xl border-l border-slate-200 dark:border-white/10">
            <ChatProfile 
              selectedChat={selectedChat}
              onClose={() => setShowProfile(false)}
              onUpdateLeadStatus={handleAcceptChat}
              filteredMessages={filteredMessages}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
