import React, { useState, useEffect } from 'react';
import {
  Activity,
  MessageSquare,
  Plus,
  Heart,
  Zap,
  BarChart3,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  LayoutGrid,
  Layers,
  Settings,
  MoreVertical,
  X,
  ShieldAlert,
  Repeat,
  Globe,
  Smartphone,
  ExternalLink,
  Edit2,
  Sparkles
} from 'lucide-react';
import { Instagram } from '../common/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, API_URL, safeJson, getInstagramAuthUrl } from '../../api';
import { getHeaders } from '../../api/common';
import { InstagramComments } from './InstagramComments';
import { InstagramSpamCenter } from './InstagramSpamCenter';
import { InstagramInbox } from './InstagramInbox';
import { InstagramPublisher } from './InstagramPublisher';
import { InstagramAnalytics } from './InstagramAnalytics';
import { InstagramScheduler } from './InstagramScheduler';
import { InstagramSettings } from './InstagramSettings';
import { InstagramOptimizer } from './InstagramOptimizer';
import { FlowBuilderView } from '../FlowBuilderView';
import { InboxView } from '../InboxView';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
const IG_COLOR = '#000000';



export const InstagramManager = ({
  user,
  messages,
  isDarkMode = true,
  onChatToggle,
  setActiveTab,
  activeSubTab,
  setActiveSubTab,
  selectedAccount: globalSelectedAccount,
  setSelectedAccount: setGlobalSelectedAccount,
  allAccounts: propAccounts
}: {
  user: any,
  messages: any[],
  isDarkMode?: boolean,
  onChatToggle?: (active: boolean) => void,
  setActiveTab: (tab: any) => void,
  activeSubTab: string,
  setActiveSubTab: (tab: string) => void,
  selectedAccount?: any,
  setSelectedAccount?: (acc: any) => void,
  allAccounts?: any[]
}) => {
  const [localAccounts, setLocalAccounts] = useState<any[]>([]);
  const [localSelectedAccount, setLocalSelectedAccount] = useState<any>(null);
  
  const accounts = propAccounts || localAccounts;
  const selectedAccount = globalSelectedAccount || localSelectedAccount;
  const setSelectedAccount = setGlobalSelectedAccount || setLocalSelectedAccount;
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const queryUid = user.parentId || user.uid;
    const q = query(collection(db, 'instagram_accounts'), where('uid', '==', queryUid));

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, platform: 'instagram', ...doc.data() }));
      setLocalAccounts(docs);
      if (docs.length > 0 && !selectedAccount) {
        setSelectedAccount(docs[0]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid, user.parentId]);

  const handleSync = async () => {
    if (!selectedAccount) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/instagram/accounts/${selectedAccount.id}/sync`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await safeJson(res);
      if (res.ok && data.account) {
        setSelectedAccount(data.account);
        setLocalAccounts(prev => prev.map(a => a.id === data.account.id ? data.account : a));
        (window as any).showToast?.('Instagram data synced!', 'success');
      } else {
        (window as any).showToast?.(data.error || 'Sync failed', 'error');
      }
    } catch (e: any) {
      (window as any).showToast?.(e.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = () => {
    window.location.href = getInstagramAuthUrl();
  };

  const handleBack = () => setActiveSubTab('overview');

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#0a0a0f]">
        <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0a0a0f]">
        <div className="w-20 h-20 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-8 shadow-2xl">
          <Instagram size={40} className="text-white dark:text-black" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Link Instagram</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">Connect your Business account to manage messages and comments from one place.</p>
        <button
          onClick={handleConnect}
          className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-3 shadow-xl"
        >
          Connect Now
          <ExternalLink size={16} />
        </button>
      </div>
    );
  }

  const NODES = [
    { id: 'inbox', label: 'DM Inbox', desc: 'Direct Messages', icon: <MessageSquare />, color: 'bg-purple-500' },
    { id: 'comments', label: 'Comments', desc: 'Manage Replies', icon: <Heart />, color: 'bg-pink-500' },
    { id: 'spam', label: 'Spam Center', desc: 'Security & Audit', icon: <ShieldAlert />, color: 'bg-red-500' },
    { id: 'publisher', label: 'Publisher', desc: 'Post Creator', icon: <Plus />, color: 'bg-emerald-500' },
    { id: 'analytics', label: 'Insights', desc: 'Account Growth', icon: <BarChart3 />, color: 'bg-cyan-500' },
    { id: 'ai', label: 'Auto Reply', desc: 'AI Automation', icon: <Sparkles />, color: 'bg-blue-600' },
    { id: 'flow', label: 'Flow Connect', desc: 'Automation Builder', icon: <Zap />, color: 'bg-emerald-600' },
    { id: 'settings', label: 'Settings', desc: 'Account Config', icon: <Settings />, color: 'bg-slate-500' },
  ];

  return (
    <div className="bg-white dark:bg-[#0a0a0f]">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="no-scrollbar"
          >
            {activeSubTab === 'overview' && (
              <div className="p-0 space-y-8">
                {/* Account Selection Header */}
                <div className="px-3 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#16161d] rounded-xl border border-transparent dark:border-white/5 overflow-x-auto no-scrollbar max-w-[calc(100vw-80px)] sm:max-w-none">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccount(acc)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-tight whitespace-nowrap",
                          selectedAccount?.id === acc.id
                            ? "bg-white dark:bg-[#13131a] text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        {acc.username || acc.name}
                      </button>
                    ))}
                    <button
                      onClick={handleConnect}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-black dark:hover:bg-white dark:hover:text-black rounded-lg transition-all flex-none"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={handleSync} disabled={syncing} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-black dark:hover:text-white transition-all">
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Profile Summary Row */}
                <div className="px-3">
                  <div className="bg-white dark:bg-[#16161d] p-6 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-6">
                    <div className="relative">
                      {selectedAccount?.profilePicture ? (
                        <img src={selectedAccount.profilePicture} className="w-16 h-16 rounded-xl object-cover border-4 border-slate-50 dark:border-white/5 shadow-lg" alt="" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg"><Instagram size={24} /></div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#16161d]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">@{selectedAccount?.username}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{(selectedAccount?.followers_count || 0).toLocaleString()} Followers</p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Grid - Exactly like Threads */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-3">
                  {NODES.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setActiveSubTab(node.id)}
                      className="bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/5 p-5 rounded-xl flex flex-col gap-4 text-left hover:border-black dark:hover:border-white transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", node.color)}>
                          {React.cloneElement(node.icon as React.ReactElement, { size: 20 })}
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{node.label}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 opacity-60 truncate">{node.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab !== 'overview' && (
              <div className="h-full flex flex-col">
                {/* Back Button Header - Visible on all screens */}
                {activeSubTab !== 'inbox' && (
                  <div className="flex px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0f] items-center gap-3 sm:gap-4 sticky top-0 z-50">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-black dark:hover:text-white">
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        {NODES.find(n => n.id === activeSubTab)?.label}
                      </h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram • {selectedAccount?.username}</p>
                    </div>
                  </div>
                )}

                <div className={`flex-1 ${activeSubTab === 'inbox' ? '' : 'overflow-y-auto no-scrollbar pb-0 sm:pb-0'}`}>
                  {activeSubTab === 'inbox' && <InboxView user={user} messages={messages} platform="instagram" selectedAccount={selectedAccount} isDarkMode={isDarkMode} onChatToggle={onChatToggle} onBack={handleBack} />}
                  {activeSubTab === 'comments' && <InstagramComments user={user} account={selectedAccount} />}
                  {activeSubTab === 'spam' && <InstagramSpamCenter user={user} account={selectedAccount} />}
                  {activeSubTab === 'publisher' && <InstagramPublisher user={user} account={selectedAccount} />}
                  {activeSubTab === 'scheduler' && <InstagramScheduler user={user} account={selectedAccount} />}
                  {activeSubTab === 'settings' && <InstagramSettings user={user} account={selectedAccount} />}
                  {activeSubTab === 'analytics' && <InstagramAnalytics user={user} account={selectedAccount} />}
                  {activeSubTab === 'ai' && <InstagramSettings user={user} account={selectedAccount} />}
                  {activeSubTab === 'flow' && <FlowBuilderView user={user} initialChannel="instagram" />}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstagramManager;
