import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getFileUrl } from '../../api/common';
import {
  LayoutDashboard,
  Smartphone,
  Send,
  Users,
  BarChart3,
  Brain,
  TrendingUp,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Share2,
  Globe,
  Layers,
  MessageSquare,
  Heart,
  LayoutGrid
} from 'lucide-react';
import { Instagram, Threads } from '../common/BrandIcons';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export type DashboardTab =
  | 'overview'
  | 'accounts'
  | 'inbox'
  | 'whatsapp'
  | 'instagram'
  | 'contacts'
  | 'ads'
  | 'agent'
  | 'leads'
  | 'tools'
  | 'settings'
  | 'profile'
  | 'users'
  | 'knowledge'
  | 'flows'
  | 'integrations'
  | 'threads'
  | 'widget'
  | 'manage-pages';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  user: any;
  userRole: string;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  handleLogout: () => void;
  notifications: any[];
  hideMobileNav?: boolean;
  selectedAccount?: any;
  setSelectedAccount?: (acc: any) => void;
  allAccounts?: any[];
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

const NAV_GROUPS = [
  {
    title: 'Main',
    items: [
      { id: 'overview', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Dashboard', color: '#6366f1' },
    ]
  },
  {
    title: 'Channels',
    items: [
      { id: 'whatsapp', icon: <Send className="w-[18px] h-[18px]" />, label: 'WhatsApp', color: '#10b981' },
      { id: 'instagram', icon: <Instagram className="w-[18px] h-[18px]" />, label: 'Instagram', color: '#ec4899' },
      { id: 'threads', icon: <Threads className="w-[18px] h-[18px]" />, label: 'Threads', color: '#000000' },
      { id: 'widget', icon: <Globe className="w-[18px] h-[18px]" />, label: 'Website Widget', color: '#6366f1' },
      { id: 'manage-pages', icon: <Globe className="w-[18px] h-[18px]" />, label: 'Manage Pages', color: '#1877F2' },
      { id: 'contacts', icon: <Users className="w-[18px] h-[18px]" />, label: 'Contacts', color: '#f59e0b' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'ads', icon: <BarChart3 className="w-[18px] h-[18px]" />, label: 'Ads Manager', color: '#f97316' },
      { id: 'agent', icon: <Brain className="w-[18px] h-[18px]" />, label: 'AI Agent', color: '#a855f7' },
      { id: 'flows', icon: <Zap className="w-[18px] h-[18px]" />, label: 'Flows Builder', color: '#f59e0b' },
      { id: 'knowledge', icon: <Sparkles className="w-[18px] h-[18px]" />, label: 'Knowledge', color: '#6366f1' },
      { id: 'leads', icon: <TrendingUp className="w-[18px] h-[18px]" />, label: 'Leads Hub', color: '#14b8a6' },
      { id: 'tools', icon: <Zap className="w-[18px] h-[18px]" />, label: 'Tools', color: '#eab308' },
      { id: 'integrations', icon: <Share2 className="w-[18px] h-[18px]" />, label: 'Integrations', color: '#6366f1' },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'settings', icon: <Settings className="w-[18px] h-[18px]" />, label: 'Settings', color: '#64748b' },
    ]
  }
] as const;

const BOTTOM_NAV = [
  { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home', color: '#6366f1' },
  { id: 'whatsapp', icon: <Send className="w-5 h-5" />, label: 'WhatsApp', color: '#10b981' },
  { id: 'contacts', icon: <Users className="w-5 h-5" />, label: 'Contacts', color: '#f59e0b' },
] as const;

export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  user,
  userRole,
  isDarkMode,
  setIsDarkMode,
  handleLogout,
  notifications,
  hideMobileNav = false,
  selectedAccount,
  setSelectedAccount,
  allAccounts,
  activeSubTab,
  setActiveSubTab,
}: DashboardLayoutProps) {
  const currentPlatformAccounts = React.useMemo(() => {
    if (!allAccounts) return [];
    // Map tab to platform name
    const platform = activeTab === 'threads' ? 'threads' : 
                     activeTab === 'instagram' ? 'instagram' : 
                     activeTab === 'whatsapp' ? 'whatsapp' : null;
    if (!platform) return [];
    return allAccounts.filter(acc => {
      const accPlat = acc.platform || 
                     (acc.phoneNumber ? 'whatsapp' : 
                     (acc.username && !acc.threadsId ? 'instagram' : 'threads'));
      return accPlat === platform;
    });
  }, [allAccounts, activeTab]);

  const isPinnedTab = React.useMemo(() => {
    return ['inbox', 'flows', 'agent', 'threads', 'knowledge'].includes(activeTab) || 
           (['whatsapp', 'instagram'].includes(activeTab) && activeSubTab === 'inbox');
  }, [activeTab, activeSubTab]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const currentScrollY = contentRef.current.scrollTop;
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;
      if (currentScrollY > lastScrollY && currentScrollY > 80) setShowHeader(false);
      else setShowHeader(true);
      setLastScrollY(currentScrollY);
    };
    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  // Note: dark mode class is managed by App.tsx to avoid duplicate effects
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getTabColor = (id: string): string => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.id === id) return item.color;
      }
    }
    return '#6366f1';
  };

  const currentColor = getTabColor(activeTab);

  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', height: '100%', width: '100%', background: isDarkMode ? '#0f0f13' : '#f4f6fb', position: 'relative', overflow: 'hidden' }}>
        
        {/* Sidebar */}
        <aside style={{
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          width: isSidebarOpen ? '260px' : '72px',
          height: '100%',
          background: isDarkMode ? '#16161d' : '#ffffff',
          transition: 'all 0.3s ease',
          zIndex: 50,
          borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        }}>
          <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: isSidebarOpen ? '0 20px' : '0 16px', gap: '12px', flexShrink: 0, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0' }}>
            <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg"><Zap className="text-white dark:text-black w-5 h-5 fill-current" /></div>
            {isSidebarOpen && <span className="font-black text-lg tracking-tighter uppercase">ChatWizs</span>}
          </div>
          <nav className="flex-1 p-2 overflow-y-auto no-scrollbar">
            {NAV_GROUPS.map(group => (
              <div key={group.title} className="mb-6">
                {isSidebarOpen && <div className="px-4 py-2 text-[10px] font-black text-slate-400 tracking-widest">{group.title}</div>}
                {group.items.map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all mb-1", activeTab === item.id ? "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/2")}>
                    <div style={{ color: activeTab === item.id ? item.color : 'inherit' }}>{item.icon}</div>
                    {isSidebarOpen && <span className="text-xs font-black tracking-tight">{item.label}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-100 dark:border-white/5">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 bg-rose-500/10 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"><LogOut size={16} />{isSidebarOpen && "Sign Out"}</button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div ref={contentRef} className={cn("flex-1 flex flex-col min-h-0 overflow-x-hidden no-scrollbar relative", isPinnedTab ? "overflow-y-hidden" : "overflow-y-auto")}>
            
            {/* Slim Header */}
            <motion.header
              animate={{ y: activeTab === 'flows' ? -100 : 0 }}
              className="h-16 py-2 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 sticky top-0 z-60 w-full"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => isMobile ? setIsMobileDrawerOpen(true) : setIsSidebarOpen(!isSidebarOpen)} className="p-2 border border-slate-100 dark:border-white/10 rounded-lg text-slate-500 hover:text-black dark:hover:text-white transition-all"><Menu size={14} /></button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {selectedAccount ? (
                      <div onClick={() => setActiveSubTab?.('overview')} className="flex items-center gap-2 px-2.5 py-1.5 border border-blue-500/20 dark:border-blue-500/10 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 backdrop-blur-sm cursor-pointer hover:border-blue-500 transition-all z-10 relative">
                        <div className="w-6 h-6 rounded-lg bg-black dark:bg-white flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                          {selectedAccount.profilePicture ? <img src={selectedAccount.profilePicture} className="w-full h-full object-cover" /> : <span className="text-white dark:text-black text-[9px] font-black">{(selectedAccount.username || selectedAccount.name || '?')[0].toUpperCase()}</span>}
                        </div>
                        <div className="flex flex-col text-left min-w-0 pr-1">
                          <h4 className="text-[10px] font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1 truncate uppercase tracking-tight">
                            {selectedAccount.username ? `@${selectedAccount.username}` : (selectedAccount.name || selectedAccount.phoneNumber)}
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          </h4>
                          {activeTab !== 'inbox' && (
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{activeTab}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span onClick={() => setActiveSubTab?.('overview')} className="text-sm font-black lowercase text-slate-900 dark:text-white cursor-pointer hover:text-blue-500 transition-all px-2 tracking-tight">{activeTab.replace('-', ' ')}</span>
                    )}

                    {/* Other accounts for same platform */}
                    {currentPlatformAccounts.length > 1 && (
                      <div className="flex items-center -ml-2 pl-4 pr-2 py-1 bg-slate-100/50 dark:bg-white/5 rounded-r-xl border border-l-0 border-slate-100 dark:border-white/5">
                        {currentPlatformAccounts.filter(acc => acc.id !== selectedAccount?.id).slice(0, 3).map(acc => (
                          <button 
                            key={acc.id} 
                            onClick={() => setSelectedAccount?.(acc)}
                            className="w-6 h-6 rounded-lg border-2 border-white dark:border-[#0a0a0f] -ml-2 first:ml-0 hover:scale-110 hover:z-20 transition-all overflow-hidden bg-slate-200 dark:bg-white/10"
                            title={acc.username || acc.name || acc.phoneNumber}
                          >
                            {acc.profilePicture ? (
                              <img src={acc.profilePicture} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-500 bg-white dark:bg-[#16161d]">
                                {(acc.username || acc.name || '?')[0].toUpperCase()}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 border border-slate-100 dark:border-white/10 rounded-lg text-slate-500">{isDarkMode ? <Sun size={14} /> : <Moon size={14} />}</button>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 border border-slate-100 dark:border-white/10 rounded-lg text-slate-500"><Bell size={14} /></button>
                <button onClick={() => setActiveTab('profile' as any)} className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-full pr-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-[10px] overflow-hidden">
                    {user?.photoURL ? <img src={getFileUrl(user.photoURL)} className="w-full h-full object-cover" /> : "U"}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{user?.displayName?.split(' ')[0]}</span>
                </button>
              </div>
            </motion.header>

            <div className="flex-1 flex flex-col min-h-0 w-full max-w-[1920px] mx-auto p-0 pb-20 md:pb-0">{children}</div>
          </div>

          {/* Bottom Nav */}
          {isMobile && !hideMobileNav && activeTab !== 'flows' && (
            <nav className="h-16 bg-white dark:bg-[#0a0a0f] border-t border-slate-100 dark:border-white/5 flex items-center justify-around px-2 fixed bottom-0 left-0 right-0 z-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              {(activeTab === 'threads' ? [
                { id: 'threads', icon: <Send size={18} />, label: 'Post', subTab: 'publisher' },
                { id: 'threads', icon: <MessageSquare size={18} />, label: 'Inbox', subTab: 'inbox' },
                { id: 'threads', icon: <Layers size={18} />, label: 'Feed', subTab: 'feed' },
                { id: 'threads', icon: <BarChart3 size={18} />, label: 'Stats', subTab: 'analytics' },
                { id: 'threads', icon: <Settings size={18} />, label: 'Profile', subTab: 'settings' }
              ] : activeTab === 'instagram' ? [
                { id: 'instagram', icon: <MessageSquare size={18} />, label: 'Inbox', subTab: 'inbox' },
                { id: 'instagram', icon: <Send size={18} />, label: 'Publish', subTab: 'publisher' },
                { id: 'instagram', icon: <Heart size={18} />, label: 'Comments', subTab: 'comments' },
                { id: 'instagram', icon: <LayoutGrid size={18} />, label: 'Schedule', subTab: 'scheduler' },
                { id: 'instagram', icon: <Settings size={18} />, label: 'Settings', subTab: 'settings' }
              ] : activeTab === 'widget' ? [
                { id: 'widget', icon: <Globe size={18} />, label: 'Widget' },
                { id: 'inbox', icon: <MessageSquare size={18} />, label: 'Inbox' },
                { id: 'flows', icon: <Zap size={18} />, label: 'Flows' },
                { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
              ] : BOTTOM_NAV).map(item => {
                const isActive = activeTab === item.id && (!('subTab' in item) || activeSubTab === item.subTab);
                return (
                  <button key={item.label} onClick={() => { setActiveTab(item.id as DashboardTab); if ('subTab' in item && setActiveSubTab) setActiveSubTab(item.subTab as string); }} className={cn("flex flex-col items-center gap-0.5 p-2 transition-all", isActive ? "text-blue-500 scale-110" : "text-slate-400")}>
                    {item.icon}
                    <span className="text-[8px] font-black tracking-widest">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </main>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileDrawerOpen(false)} className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-72 z-110 bg-white dark:bg-[#16161d] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center"><span className="font-black tracking-widest text-xs">Menu</span><button onClick={() => setIsMobileDrawerOpen(false)}><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {NAV_GROUPS.map(group => (
                  <div key={group.title}>
                    <div className="px-4 py-2 text-[9px] font-black text-slate-400 tracking-widest mb-1">{group.title}</div>
                    {group.items.map(item => (
                      <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileDrawerOpen(false); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1", activeTab === item.id ? "bg-slate-100 dark:bg-white/5 text-blue-600" : "text-slate-500 hover:bg-slate-50")}>
                        <div style={{ color: activeTab === item.id ? item.color : 'inherit' }}>{item.icon}</div>
                        <span className="text-xs font-black tracking-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
