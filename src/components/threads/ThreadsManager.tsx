import React, { useState, useEffect } from 'react';
import { 
  Send, 
  BarChart3, 
  Settings, 
  Plus, 
  MessageCircle, 
  MessageSquare,
  Share2, 
  Heart, 
  Repeat,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertCircle,
  Layers,
  LayoutGrid,
  ChevronLeft,
  Sparkles,
  Zap,
  Globe,
  Shield,
  ShieldAlert,
  Edit2,
  UploadCloud,
  Loader2,
  Users
} from 'lucide-react';
import { Threads } from '../common/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, updateDoc, API_URL, getHeaders } from '../../api';

// Components
import { ThreadsPublisher } from './ThreadsPublisher.tsx';
import { ThreadsAnalytics } from './ThreadsAnalytics.tsx';
import { ThreadsFeed } from './ThreadsFeed.tsx';
import { ThreadsComments } from './ThreadsComments.tsx';
import { ThreadsInbox } from './ThreadsInbox.tsx';
import { ThreadsSpam } from './ThreadsSpam.tsx';
import { FlowBuilderView } from '../FlowBuilderView.tsx';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
const THREADS_COLOR = '#000000';

export const ThreadsManager = ({ 
  user, 
  activeSubTab: globalActiveSubTab, 
  setActiveSubTab: setGlobalActiveSubTab,
  setActiveTab,
  selectedAccount: globalSelectedAccount,
  setSelectedAccount: setGlobalSelectedAccount,
  allAccounts: propAccounts
}: { 
  user: any, 
  activeSubTab?: string, 
  setActiveSubTab?: (tab: string) => void,
  setActiveTab?: (tab: any) => void,
  selectedAccount?: any,
  setSelectedAccount?: (acc: any) => void,
  allAccounts?: any[]
}) => {
  const [localActiveSubTab, setLocalActiveSubTab] = useState<'overview' | 'publisher' | 'feed' | 'analytics' | 'settings' | 'comments' | 'inbox' | 'spam'>('overview');
  const [localSelectedAccount, setLocalSelectedAccount] = useState<any>(null);
  const [localAccounts, setLocalAccounts] = useState<any[]>([]);

  const selectedAccount = globalSelectedAccount || localSelectedAccount;
  const setSelectedAccount = setGlobalSelectedAccount || setLocalSelectedAccount;
  const accounts = propAccounts || localAccounts;

  const activeSubTab = (globalActiveSubTab as any) || localActiveSubTab;
  const setActiveSubTab = (tab: any) => {
    if (setGlobalActiveSubTab) setGlobalActiveSubTab(tab);
    else setLocalActiveSubTab(tab);
  };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ views: 0, likes: 0, reposts: 0, replies: 0, quotes: 0, followers: 0 });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editPic, setEditPic] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        // Use the relative path or absolute URL
        setEditPic(data.url);
        (window as any).showToast("Photo uploaded successfully", "success");
      }
    } catch (err) {
      (window as any).showToast("Upload failed", "error");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedAccount) return;
    setIsUpdatingProfile(true);
    try {
      const res = await fetch(`${API_URL}/threads/profile`, {
        method: 'POST',
        headers: { 
          ...getHeaders(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          biography: editBio,
          profilePicture: editPic
        })
      });
      const data = await res.json();
      if (res.ok) {
        (window as any).showToast("Profile updated on Meta", "success");
        setShowProfileEditor(false);
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err: any) {
      (window as any).showToast(err.message, "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, 'threads_accounts'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ id: doc.id, platform: 'threads', ...doc.data() }));
      setLocalAccounts(accs);
      if (accs.length > 0 && !selectedAccount) {
        setSelectedAccount(accs[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedAccount?.id) return;
      try {
        const res = await fetch(`${API_URL}/threads/profile?accountId=${selectedAccount.id}`, {
          headers: getHeaders()  // ← Auth header was missing — this is a protected route
        });
        const data = await res.json();
        if (res.ok && data) {
          setStats({
            views: data.stats?.views || 0,
            likes: Math.max(data.stats?.likes || 0, data.aggregated?.likes || 0),
            reposts: Math.max(data.stats?.reposts || 0, data.aggregated?.reposts || 0),
            replies: Math.max(data.stats?.replies || 0, data.aggregated?.replies || 0),
            quotes: Math.max(data.stats?.quotes || 0, data.aggregated?.quotes || 0),
            followers: data.follower_count || 0
          });
        } else {
          console.warn('[Threads Stats] Failed:', data?.error);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, [selectedAccount]);

  const handleConnectThreads = () => {
    const authUrl = `${API_URL}/threads/connect?origin=${encodeURIComponent(window.location.origin)}`;
    
    // On mobile, popups are blocked or intercepted by the native Threads app.
    // Use direct navigation instead so the browser handles the full OAuth flow.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (isMobile) {
      // Save current location so we can return after auth
      sessionStorage.setItem('threads_auth_return', window.location.href);
      // Navigate directly in browser — avoids native app interception
      window.location.href = authUrl;
    } else {
      // Desktop: popup so user stays on dashboard
      const popup = window.open(authUrl, 'threads_auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          (window as any).showToast?.('Checking for new Threads account...', 'info');
        }
      }, 500);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncProfile = async () => {
    if (!selectedAccount) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/threads/profile?accountId=${selectedAccount.id}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.username) {
        await updateDoc(`threads_accounts/${selectedAccount.id}`, {
          biography: data.biography || data.threads_biography || '',
          profilePicture: data.profilePicture || data.threads_profile_picture_url || '',
          followerCount: data.follower_count || 0,
          updatedAt: new Date().toISOString()
        });
        (window as any).showToast("Profile synced with Meta", "success");
      }
    } catch (err) {
      console.error("Sync failed:", err);
      (window as any).showToast("Sync failed", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
      if (confirm('Are you sure you want to disconnect this Threads account?')) {
          try {
              await fetch(`${API_URL}/threads/accounts/${id}`, { method: 'DELETE' });
              (window as any).showToast("Account disconnected", "success");
          } catch (e) {
              (window as any).showToast("Delete failed", "error");
          }
      }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="animate-spin text-slate-300" size={32} />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0f0f13]">
        <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center mb-8 shadow-2xl">
          <Threads size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Link Your Threads</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">Connect your Threads account to schedule posts, track analytics, and manage your engagement from one place.</p>
        <button 
          onClick={handleConnectThreads}
          className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-3 shadow-xl"
        >
          Connect Now
          <ExternalLink size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0f]">
      {/* Main Content Area */}
      <div className={cn("flex-1 relative min-h-0", !['inbox', 'comments', 'spam'].includes(activeSubTab) && "overflow-y-auto no-scrollbar")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
              "no-scrollbar",
              ['inbox', 'comments', 'spam'].includes(activeSubTab) && "h-full"
            )}
          >
            {activeSubTab === 'overview' && (
              <div className="p-0 space-y-8 pb-20">
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
                        onClick={handleConnectThreads}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-black dark:hover:bg-white dark:hover:text-black rounded-lg transition-all flex-none"
                        title="Add New Threads Account"
                      >
                        <Plus size={14} />
                      </button>
                   </div>
                   <button onClick={handleSyncProfile} disabled={isSyncing} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-black dark:hover:text-white transition-all">
                      <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                   </button>
                </div>

                {/* Stats Summary Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-3 mt-3">
                  {[
                    { label: 'Views', value: (stats.views || 0).toLocaleString(), color: 'bg-blue-500', icon: <Layers size={16} /> },
                    { label: 'Likes', value: (stats.likes || 0).toLocaleString(), color: 'bg-rose-500', icon: <Heart size={16} /> },
                    { label: 'Reposts', value: (stats.reposts || 0).toLocaleString(), color: 'bg-emerald-500', icon: <Repeat size={16} /> },
                    { label: 'Replies', value: (stats.replies || 0).toLocaleString(), color: 'bg-indigo-500', icon: <MessageSquare size={16} /> },
                    { label: 'Followers', value: (stats.followers || selectedAccount?.followerCount || 0).toLocaleString(), color: 'bg-purple-500', icon: <Users size={16} /> },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#16161d] p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className={`w-7 h-7 ${stat.color} text-white rounded-lg flex items-center justify-center mb-2 shadow-lg shadow-black/5`}>
                        {stat.icon}
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</h4>
                    </div>
                  ))}
                </div>

                {/* Quick Action Grid - Expanded for Mobile Access */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-3">
                  <div onClick={() => setActiveSubTab('publisher')} className="group cursor-pointer bg-black dark:bg-white p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <Send className="text-white dark:text-black mb-3" size={20} />
                    <h3 className="text-xs font-black text-white dark:text-black uppercase">Create</h3>
                  </div>
                  <div onClick={() => setActiveSubTab('inbox')} className="group cursor-pointer bg-emerald-600 p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <MessageSquare className="text-white mb-3" size={20} />
                    <h3 className="text-xs font-black text-white uppercase">DM Inbox</h3>
                  </div>
                  <div onClick={() => setActiveSubTab('comments')} className="group cursor-pointer bg-blue-600 p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <MessageCircle className="text-white mb-3" size={20} />
                    <h3 className="text-xs font-black text-white uppercase">Comments</h3>
                  </div>
                  <div onClick={() => setActiveSubTab('analytics')} className="group cursor-pointer bg-purple-600 p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <BarChart3 className="text-white mb-3" size={20} />
                    <h3 className="text-xs font-black text-white uppercase">Insights</h3>
                  </div>
                  <div onClick={() => setActiveSubTab('settings')} className="group cursor-pointer bg-indigo-600 p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <Sparkles className="text-white mb-3" size={20} />
                    <h3 className="text-xs font-black text-white uppercase">Auto Reply</h3>
                  </div>
                  <div onClick={() => setActiveSubTab('flow')} className="group cursor-pointer bg-slate-800 p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <Zap className="text-white mb-3" size={20} />
                    <h3 className="text-xs font-black text-white uppercase">Flows</h3>
                  </div>
                  <div onClick={() => setActiveSubTab('spam')} className="group cursor-pointer bg-rose-600 p-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden">
                    <ShieldAlert className="text-white mb-3" size={20} />
                    <h3 className="text-xs font-black text-white uppercase">Spam Center</h3>
                  </div>
                </div>



              </div>
            )}
            {activeSubTab === 'publisher' && (
               <ThreadsPublisher user={user} account={selectedAccount} />
            )}
             {activeSubTab === 'comments' && (
               <div className="h-full"><ThreadsComments user={user} account={selectedAccount} /></div>
            )}
            {activeSubTab === 'inbox' && (
               <ThreadsInbox user={user} account={selectedAccount} />
            )}
            {activeSubTab === 'feed' && (
               <ThreadsFeed user={user} account={selectedAccount} />
            )}
            {activeSubTab === 'analytics' && (
               <ThreadsAnalytics user={user} account={selectedAccount} />
            )}
            {activeSubTab === 'spam' && (
               <ThreadsSpam user={user} account={selectedAccount} />
            )}
            {activeSubTab === 'flow' && (
               <FlowBuilderView user={user} initialChannel="threads" />
            )}
            {activeSubTab === 'settings' && (
               <div className="flex-1 bg-slate-50 dark:bg-[#0a0a0f] pb-20">
                  <div className="p-2 sm:p-3 space-y-3">
                    {/* Account Profile Card */}
                    <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                          <div className="relative">
                            <img 
                              src={selectedAccount?.profilePicture || `https://ui-avatars.com/api/?name=${selectedAccount?.username}&background=random`} 
                              className="w-24 h-24 rounded-xl object-cover border-4 border-slate-50 dark:border-white/5 shadow-xl"
                              alt="Profile"
                            />
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white dark:border-[#16161d]" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">@{selectedAccount?.username}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center justify-center sm:justify-start gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              Status: {selectedAccount?.status || 'Active'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-3">
                           <button 
                             onClick={() => {
                               setEditBio(selectedAccount.biography || '');
                               setEditPic(selectedAccount.profilePicture || '');
                               setShowProfileEditor(true);
                             }}
                             className="w-full sm:w-auto px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                           >
                             <Edit2 size={14} />
                             Edit Profile
                           </button>
                           <button 
                             onClick={handleSyncProfile}
                             disabled={isSyncing}
                             className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 disabled:opacity-50"
                           >
                             <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                             {isSyncing ? 'Syncing...' : 'Sync'}
                           </button>
                           <button 
                             onClick={() => handleDeleteAccount(selectedAccount.id)}
                             className="w-full sm:w-auto xs:col-span-2 sm:col-span-1 px-6 py-3 bg-rose-500/10 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                           >
                             <Trash2 size={14} />
                             Remove
                           </button>
                        </div>
                      </div>

                      {/* Profile Editor Overlay */}
                      <AnimatePresence>
                        {showProfileEditor && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#111118] w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                   <div className="flex items-center gap-3"><Edit2 className="text-blue-500" size={20} /><h3 className="text-lg font-black text-slate-900 dark:text-white">Edit profile</h3></div>
                                   <button onClick={() => setShowProfileEditor(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400"><Trash2 size={20} /></button>
                                </div>
                                <div className="p-6 space-y-6">
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update profile photo</label>
                                      <div className="flex items-center gap-4">
                                         <input type="file" id="profile-upload" onChange={handleProfilePicUpload} className="hidden" accept="image/*" />
                                         <button 
                                           onClick={() => document.getElementById('profile-upload')?.click()}
                                           disabled={isUploadingPic}
                                           className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
                                         >
                                            {isUploadingPic ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{isUploadingPic ? 'Uploading...' : 'Select from device'}</span>
                                         </button>
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biography</label>
                                      <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell the world about yourself..." className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-4 text-sm outline-none text-slate-900 dark:text-white focus:border-blue-500 transition-all resize-none" />
                                   </div>
                                   <button 
                                     onClick={handleUpdateProfile}
                                     disabled={isUpdatingProfile}
                                     className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs shadow-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                   >
                                      {isUpdatingProfile ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                      Update identity
                                   </button>
                                </div>
                             </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {selectedAccount?.biography && (
                        <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Biography</h4>
                           <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                             {selectedAccount.biography}
                           </p>
                        </div>
                      )}
                    </div>

                    {/* AI Intelligence & Automation Section */}
                    <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                       <div className="flex items-center justify-between mb-6">
                          <div>
                             <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Intelligence</h3>
                             <p className="text-[10px] text-slate-500 font-medium mt-1">Control how ChatWiz AI responds to Threads replies.</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* AI Toggle */}
                          <div 
                            onClick={async () => {
                              const newVal = !selectedAccount?.ai_enabled;
                              await updateDoc(`threads_accounts/${selectedAccount.id}`, { ai_enabled: newVal });
                              (window as any).showToast(`AI Auto-Reply ${newVal ? 'Enabled' : 'Disabled'}`, "info");
                            }}
                            className="flex items-center justify-between p-5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                          >
                             <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", selectedAccount?.ai_enabled ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-white/5 text-slate-400")}>
                                   <Sparkles size={24} />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Auto-Reply</p>
                                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: {selectedAccount?.ai_enabled ? 'Active' : 'Paused'}</p>
                                </div>
                             </div>
                             <div className={cn("w-12 h-6 rounded-full relative transition-all shadow-inner", selectedAccount?.ai_enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")}>
                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all", selectedAccount?.ai_enabled ? "right-1" : "left-1")} />
                             </div>
                          </div>

                          {/* Handoff Timer */}
                          <div className="p-5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                                      <RefreshCw size={16} />
                                   </div>
                                   <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Handoff Delay</p>
                                </div>
                                <span className="text-[10px] font-black text-blue-500 uppercase">{selectedAccount?.handoff_delay || 30} Min</span>
                             </div>
                             <div className="flex gap-2">
                                {[15, 30, 60].map(m => (
                                  <button 
                                    key={m} 
                                    onClick={async () => {
                                      await updateDoc(`threads_accounts/${selectedAccount.id}`, { handoff_delay: m });
                                      (window as any).showToast(`Handoff delay set to ${m} min`, "success");
                                    }}
                                    className={cn(
                                    "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                    (selectedAccount?.handoff_delay || 30) === m ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg" : "border-slate-200 dark:border-white/5 text-slate-400 hover:bg-white dark:hover:bg-white/5"
                                  )}>
                                    {m}m
                                  </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Profile Editor Section */}
                    <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/2">
                         <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Threads Identity</h3>
                         <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[8px] font-bold uppercase tracking-widest">Local Sync</span>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biography</label>
                           <textarea 
                              id="threads-bio-input"
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-none font-medium"
                              placeholder="Write something about yourself..."
                              defaultValue={selectedAccount?.biography || ''}
                           />
                        </div>

                        <button 
                           onClick={async () => {
                              const bio = (document.getElementById('threads-bio-input') as HTMLTextAreaElement)?.value;
                              await updateDoc(`threads_accounts/${selectedAccount.id}`, { biography: bio });
                              (window as any).showToast("Threads identity updated locally", "success");
                           }}
                           className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                        >
                           Update Identity
                        </button>
                      </div>
                    </div>

                    {/* Integration Details Section */}
                    <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                       <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Integration Details</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Platform', value: 'Threads for Business', icon: <Globe size={14} />, color: 'text-blue-500' },
                            { label: 'Sync Status', value: 'Active & Healthy', icon: <Sparkles size={14} />, color: 'text-emerald-500' },
                            { label: 'Permissions', value: 'Full Messenger Access', icon: <Shield size={14} />, color: 'text-purple-500' }
                          ].map((item, i) => (
                            <div key={i} className="p-4 bg-slate-50/50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-3">
                               <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-[#16161d] shadow-sm border border-slate-100 dark:border-white/5", item.color)}>
                                  {item.icon}
                               </div>
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                                  <p className={cn("text-[11px] font-black mt-1", item.color)}>{item.value}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* API Notice */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-4">
                       <AlertCircle className="text-amber-500 shrink-0" size={18} />
                       <div>
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Meta API Limitation</h4>
                          <p className="text-[9px] text-amber-700/70 font-medium leading-relaxed">
                             Direct Profile editing is currently restricted by Meta. Changes made here are saved to ChatWiz. To update your global profile, please use the official Threads app.
                          </p>
                       </div>
                    </div>
                  </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
